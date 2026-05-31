import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { createServiceClient } from '@/lib/supabase';
import {
  hashCode,
  MAX_ATTEMPTS,
  REMEMBER_MAX_AGE_S,
  SHORT_MAX_AGE_S,
} from '@/lib/auth-codes';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Code', type: 'text' },
        remember: { label: 'Remember', type: 'text' },
        // Break-glass only — never surfaced in the UI. See SETUP.md.
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = (credentials?.email as string | undefined)?.toLowerCase();
        const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
        if (!email || !adminEmail || email !== adminEmail) return null;

        const remember = String(credentials?.remember) === 'true';
        const code = (credentials?.code as string | undefined)?.trim();
        const password = credentials?.password as string | undefined;

        // Primary path: passwordless one-time email code.
        if (code) {
          const supabase = createServiceClient();
          const { data: rows } = await supabase
            .from('admin_login_codes')
            .select('*')
            .is('used_at', null)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

          const row = rows?.[0];
          if (!row || row.attempts >= MAX_ATTEMPTS) return null;

          if ((await hashCode(code)) !== row.code_hash) {
            await supabase
              .from('admin_login_codes')
              .update({ attempts: row.attempts + 1 })
              .eq('id', row.id);
            return null;
          }

          // Single-use: burn it on success.
          await supabase
            .from('admin_login_codes')
            .update({ used_at: new Date().toISOString() })
            .eq('id', row.id);
          return { id: 'admin', email, name: 'Aaron', remember };
        }

        // Break-glass path: env-var password, no UI. Lets us regain access if
        // the admin mailbox is ever unavailable (see SETUP.md).
        if (password && process.env.ADMIN_PASSWORD_HASH) {
          const valid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
          if (valid) return { id: 'admin', email, name: 'Aaron', remember };
        }

        return null;
      },
    }),
  ],
  // Cookie ceiling = the longest possible ("stay signed in") session. The real
  // deadline is the absExp claim set at sign-in and enforced in middleware.
  session: { strategy: 'jwt', maxAge: REMEMBER_MAX_AGE_S },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.isAdmin = true;
        const maxAgeS = (user as { remember?: boolean }).remember
          ? REMEMBER_MAX_AGE_S
          : SHORT_MAX_AGE_S;
        token.absExp = Date.now() + maxAgeS * 1000;
      }
      return token;
    },
    session({ session, token }) {
      if (token?.isAdmin) session.user.isAdmin = true;
      if (typeof token?.absExp === 'number') session.absExp = token.absExp;
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: 'vsp-session',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: { signIn: '/login' },
});
