// Shared helpers for passwordless admin sign-in codes.
//
// This module is imported by BOTH lib/auth.ts (which is bundled into the edge
// middleware) and the Node server action, so it must stay edge-safe: use the
// Web Crypto API (globalThis.crypto), never node:crypto.

/** A login code is valid for 10 minutes. */
export const CODE_TTL_MS = 10 * 60 * 1000;
/** A fresh code can't be requested more often than this (anti-spam). */
export const RESEND_COOLDOWN_MS = 60 * 1000;
/** Wrong-guess cap before a code is dead. */
export const MAX_ATTEMPTS = 5;
/** "Stay signed in" session length. */
export const REMEMBER_MAX_AGE_S = 14 * 24 * 60 * 60; // 14 days
/** Default session length when "stay signed in" is unchecked. */
export const SHORT_MAX_AGE_S = 12 * 60 * 60; // 12 hours

/**
 * Addresses allowed to sign in: ADMIN_EMAIL plus anything in the comma-separated
 * ADMIN_LOGIN_EMAILS. ADMIN_EMAIL stays a single address because contact-form
 * notifications and the List-Unsubscribe header mail to it directly.
 */
export function adminLoginEmails(): string[] {
  const raw = `${process.env.ADMIN_EMAIL || ''},${process.env.ADMIN_LOGIN_EMAILS || ''}`;
  return Array.from(new Set(raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)));
}

/** The allowed admin address matching `email`, or null if it isn't an admin. */
export function matchAdminLoginEmail(email: string | null | undefined): string | null {
  const needle = (email || '').trim().toLowerCase();
  if (!needle) return null;
  return adminLoginEmails().includes(needle) ? needle : null;
}

/** Cryptographically-random 6-digit code, zero-padded. */
export function generateCode(): string {
  const arr = new Uint32Array(1);
  globalThis.crypto.getRandomValues(arr);
  return (arr[0] % 1_000_000).toString().padStart(6, '0');
}

/** SHA-256 hex digest. We only ever store the hash of a code, never the code. */
export async function hashCode(code: string): Promise<string> {
  const data = new TextEncoder().encode(code);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
