import { AppError, ERROR_CODES, toAppError, type ErrorCode } from '@mcc/shared';
import type { z } from 'zod';

import { supabase } from './supabase';

interface QueryResult {
  data: unknown;
  error: unknown;
}

/**
 * Awaits a Supabase query and returns its data, throwing an AppError instead of returning one.
 * Typed on the whole response (R) because inferring through PostgREST's thenable loses the row type.
 */
export async function run<R extends QueryResult>(
  query: PromiseLike<R>,
): Promise<NonNullable<R['data']>> {
  let result: R;
  try {
    result = await query;
  } catch (error) {
    throw toAppError(error);
  }
  if (result.error) throw toAppError(result.error);
  if (result.data === null || result.data === undefined) throw new AppError('unknown');
  return result.data as NonNullable<R['data']>;
}

/** Like run, for `.maybeSingle()` queries where "no row" is a normal answer. */
export async function runMaybe<R extends QueryResult>(
  query: PromiseLike<R>,
): Promise<R['data'] | null> {
  let result: R;
  try {
    result = await query;
  } catch (error) {
    throw toAppError(error);
  }
  if (result.error) throw toAppError(result.error);
  return result.data ?? null;
}

/** Like run, for writes and RPCs that return nothing. */
export async function runVoid(query: PromiseLike<{ error: unknown }>): Promise<void> {
  let result: { error: unknown };
  try {
    result = await query;
  } catch (error) {
    throw toAppError(error);
  }
  if (result.error) throw toAppError(result.error);
}

function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && (ERROR_CODES as readonly string[]).includes(value);
}

/** Reads `{ error: { code } }` from a failed edge-function response. */
async function edgeErrorCode(error: unknown): Promise<ErrorCode | null> {
  const context = (error as { context?: unknown } | null)?.context;
  if (!(context instanceof Response)) return null;
  try {
    const body = (await context.clone().json()) as { error?: { code?: unknown } };
    return isErrorCode(body.error?.code) ? body.error.code : null;
  } catch {
    return null;
  }
}

/**
 * Calls an edge function and validates its response against the shared contract, so a mismatch
 * between app and function fails loudly here rather than saving bad data.
 */
export async function invokeFunction<Schema extends z.ZodType>(
  name: string,
  body: Record<string, unknown>,
  schema: Schema,
): Promise<z.infer<Schema>> {
  const { data, error } = await supabase().functions.invoke(name, { body });
  if (error) {
    const code = await edgeErrorCode(error);
    throw code ? new AppError(code, { cause: error }) : toAppError(error);
  }
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new AppError('unknown', { cause: parsed.error });
  return parsed.data;
}
