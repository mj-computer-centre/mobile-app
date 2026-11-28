// Proves the picture keys in supabase/functions/.env work, with the same code the edge functions
// run (supabase/functions/_shared). It never prints a key.
//
//   pnpm images:verify              both services
//   pnpm images:verify cloudinary   only Cloudinary
//   pnpm images:verify cloudflare   only Cloudflare
//
// Cloudflare: asks whether the token is active, then draws one picture (about 173 of the day's
// 10,000 free neurons). Cloudinary: stores a picture in the app's folder, loads it back the way
// the app shows a cover, removes it, and checks that it is gone. Nothing is left behind.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { drawPicture } from '../supabase/functions/_shared/cloudflare-ai.ts';
import {
  cloudinaryConfig,
  ownPublicId,
  removeImage,
  storeImage,
} from '../supabase/functions/_shared/cloudinary.ts';
import { coverPrompt } from '../supabase/functions/_shared/cover-prompt.ts';
import { sniffImageType } from '../supabase/functions/_shared/image-type.ts';

const envFile = join(dirname(fileURLToPath(import.meta.url)), '../supabase/functions/.env');
let env;
try {
  env = Object.fromEntries(
    readFileSync(envFile, 'utf8')
      .split('\n')
      .filter((line) => /^[A-Z0-9_]+=/.test(line))
      .map((line) => [
        line.slice(0, line.indexOf('=')),
        line
          .slice(line.indexOf('=') + 1)
          .trim()
          .replace(/^(["'])(.*)\1$/, '$2'),
      ]),
  );
} catch {
  console.error(
    'supabase/functions/.env is missing. Copy supabase/functions/.env.example and fill it in.',
  );
  process.exit(1);
}

const only = process.argv[2];
let failed = false;
const say = (ok, text) => {
  if (!ok) failed = true;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${text}`);
};

// A small plain PNG, for when Cloudflare is not being checked and there is no drawn picture.
const PLAIN = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAIAAAC0SDtlAAAAFElEQVR42mP4v02eJMQwqmFQaAAAS6YHUONzBZEAAAAASUVORK5CYII=',
  ),
  (char) => char.charCodeAt(0),
);
let picture = PLAIN;

if (!only || only === 'cloudflare') {
  console.log('Cloudflare Workers AI (the "Make one with AI" pictures)');
  const accountId = env.CLOUDFLARE_ACCOUNT_ID ?? '';
  const token = env.CLOUDFLARE_AI_TOKEN ?? '';
  say(/^[0-9a-f]{32}$/.test(accountId), 'CLOUDFLARE_ACCOUNT_ID looks like an account id');
  say(Boolean(token), 'CLOUDFLARE_AI_TOKEN is set');

  if (accountId && token) {
    // A token made under "My Profile" is checked at /user, one made in the account at /accounts.
    const headers = { Authorization: `Bearer ${token}` };
    const checks = await Promise.all(
      [`accounts/${accountId}/tokens/verify`, 'user/tokens/verify'].map(async (path) => {
        const response = await fetch(`https://api.cloudflare.com/client/v4/${path}`, { headers });
        return (await response.json().catch(() => null))?.result;
      }),
    );
    const active = checks.find((result) => result?.status === 'active');
    say(
      Boolean(active),
      active
        ? `the token is active (${active.expires_on ? `expires ${active.expires_on}` : 'no expiry date'})`
        : 'Cloudflare says the token is not active',
    );

    const started = Date.now();
    const drawn = await drawPicture(
      { accountId, token },
      coverPrompt(
        { title: 'DCA', description: 'Diploma in Computer Applications', details: '' },
        3,
      ),
    );
    if (drawn.ok) {
      picture = Uint8Array.from(atob(drawn.image.slice(drawn.image.indexOf(',') + 1)), (char) =>
        char.charCodeAt(0),
      );
      say(
        true,
        `drew a picture: ${sniffImageType(picture)}, ${Math.round(picture.length / 1024)} KB in ${Date.now() - started} ms`,
      );
    } else {
      say(
        false,
        drawn.reason === 'used_up'
          ? 'today’s free allowance on this account is used up (it resets at midnight UTC)'
          : 'could not draw a picture (see the line above)',
      );
    }
  }
}

if (!only || only === 'cloudinary') {
  console.log('Cloudinary (where course covers and banners are kept)');
  const config = cloudinaryConfig((name) => env[name]);
  say(
    Boolean(config),
    'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are set',
  );
  if (config) {
    console.log(`     folder: ${config.folder}`);
    const started = Date.now();
    const url = await storeImage(config, 'course', picture, sniffImageType(picture) ?? 'png');
    say(Boolean(url), `stored a picture with a signed upload (${Date.now() - started} ms)`);
    const publicId = url ? ownPublicId(url, config) : null;
    if (url && publicId) {
      say(publicId.startsWith(`${config.folder}/courses/`), `it is in ${config.folder}/courses`);
      const shown = await fetch(
        url.replace('/image/upload/', '/image/upload/c_fill,ar_16:9/c_limit,w_960/f_auto,q_auto/'),
      );
      const bytes = (await shown.arrayBuffer()).byteLength;
      say(
        shown.ok && (shown.headers.get('content-type') ?? '').startsWith('image/'),
        `the 16:9 cover loads: HTTP ${shown.status}, ${shown.headers.get('content-type')}, ${Math.max(1, Math.round(bytes / 1024))} KB`,
      );
      say(await removeImage(config, publicId), 'removed it again');
    }
  }
}

console.log(failed ? '\nSomething failed: see above.' : '\nEverything works.');
process.exit(failed ? 1 : 0);
