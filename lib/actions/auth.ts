'use server';

import { createServiceClient } from '@/lib/supabase';
import { sendLoginCode } from '@/lib/email/login-code';
import { generateCode, hashCode, CODE_TTL_MS, RESEND_COOLDOWN_MS } from '@/lib/auth-codes';

/**
 * Emails a one-time sign-in code to the admin address.
 *
 * Always resolves to `{ ok: true }` regardless of whether the email matched the
 * admin or a send happened, so the login UI can't be used to probe addresses or
 * send state. Real failures are logged server-side.
 */
export async function requestLoginCode(emailRaw: string): Promise<{ ok: true }> {
  const email = (emailRaw || '').trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
  if (!email || !adminEmail || email !== adminEmail) return { ok: true };

  const supabase = createServiceClient();
  const now = Date.now();

  // Anti-spam: skip if an unused code was already issued within the cooldown.
  const cooldownCutoff = new Date(now - RESEND_COOLDOWN_MS).toISOString();
  const { data: recent } = await supabase
    .from('admin_login_codes')
    .select('id')
    .is('used_at', null)
    .gt('created_at', cooldownCutoff)
    .limit(1);
  if (recent && recent.length > 0) return { ok: true };

  // Opportunistic cleanup so the table doesn't grow unbounded.
  await supabase
    .from('admin_login_codes')
    .delete()
    .lt('expires_at', new Date(now).toISOString());

  const code = generateCode();
  const { error } = await supabase.from('admin_login_codes').insert({
    code_hash: await hashCode(code),
    expires_at: new Date(now + CODE_TTL_MS).toISOString(),
  });
  if (error) {
    console.error('[auth] requestLoginCode insert:', error.message);
    return { ok: true };
  }

  await sendLoginCode(process.env.ADMIN_EMAIL!, code);
  return { ok: true };
}
