// Draws one picture with FLUX.1 [schnell] on Cloudflare Workers AI, over its REST API.
// Every Cloudflare account gets 10,000 "neurons" a day free. A picture (always 1024x1024) costs
// about 173 of them at 4 steps: measured on 28 Nov 2026, when a new account's allowance ran out
// after 58 pictures. That fits 4 tiles, each at 4.8 plus 9.6 a step. So the free allowance is
// about 57 pictures a day; fewer steps would cost less and look worse. The model's licence
// allows commercial use.
import { sniffImageType } from './image-type.ts';

const MODEL = '@cf/black-forest-labs/flux-1-schnell';
const TIMEOUT_MS = 45_000;

export interface CloudflareConfig {
  accountId: string;
  token: string;
}

/** The account id and token from the function's secrets, or null when they are not set. */
export function cloudflareConfig(): CloudflareConfig | null {
  const accountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')?.trim();
  const token = Deno.env.get('CLOUDFLARE_AI_TOKEN')?.trim();
  return accountId && token ? { accountId, token } : null;
}

export type DrawResult =
  | { ok: true; image: string }
  /** `used_up`: the account's free allowance for today is gone (it resets at midnight UTC). */
  | { ok: false; reason: 'used_up' | 'failed' };

/** One picture as a data URL. Never throws: a failure comes back as a reason. */
export async function drawPicture(config: CloudflareConfig, prompt: string): Promise<DrawResult> {
  let response: Response;
  let data: {
    result?: { image?: string };
    errors?: { code?: number; message?: string }[];
  } | null;
  try {
    response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/ai/run/${MODEL}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
        // The model accepts only these two; anything else is refused (error 5006).
        body: JSON.stringify({ prompt, steps: 4 }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
    data = await response.json().catch(() => null);
  } catch (error) {
    console.error('cloudflare-ai: request failed', error instanceof Error ? error.message : error);
    return { ok: false, reason: 'failed' };
  }

  const image = data?.result?.image;
  const kind = image ? sniffImageType(firstBytes(image)) : null;
  if (response.ok && image && kind)
    return { ok: true, image: `data:image/${kind};base64,${image}` };

  const errors = data?.errors ?? [];
  console.error(
    'cloudflare-ai: no picture',
    response.status,
    errors.map((error) => `${error.code} ${error.message}`).join('; '),
  );
  // 4006: the account's free daily neurons are used up.
  const usedUp =
    response.status === 429 ||
    errors.some((error) => error.code === 4006 || /allocation/i.test(error.message ?? ''));
  return { ok: false, reason: usedUp ? 'used_up' : 'failed' };
}

/** The first bytes of a base64 string, enough to tell what kind of picture it is. */
function firstBytes(base64: string): Uint8Array {
  try {
    return Uint8Array.from(atob(base64.slice(0, 24)), (char) => char.charCodeAt(0));
  } catch {
    return new Uint8Array();
  }
}
