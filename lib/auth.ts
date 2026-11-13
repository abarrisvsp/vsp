import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { createServiceClient } from '@/lib/supabase';
import {
  hashCode,
  matchAdminLoginEmail,
  MAX_ATTEMPTS,
  PASSWORD_FAILURE_MARKER,
  PASSWORD_LOCKOUT_MS,
  PASSWORD_MAX_FAILURES,
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
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const login = ((credentials?.email as string | undefined) || '').trim();
        const remember = String(credentials?.remember) === 'true';
        const code = (credentials?.code as string | undefined)?.trim();
        const password = credentials?.password as string | undefined;

        // Primary path: passwordless one-time email code.
        const email = matchAdminLoginEmail(login);
        if (code && email) {
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
          return { id: 'admin', email, remember };
        }

        // Password path: username (or admin email) + password, both set in
        // Vercel as ADMIN_USERNAME / ADMIN_PASSWORD. Works when email is down.
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminUsername = (process.env.ADMIN_USERNAME || '').trim().toLowerCase();
        const loginOk =
          !!email || (!!adminUsername && login.toLowerCase() === adminUsername);
        if (password && adminPassword && loginOk) {
          const supabase = createServiceClient();
          const now = Date.now();

          // Lockout: too many recent wrong passwords pauses password sign-in.
          // Failures are logged as already-used rows in admin_login_codes, so
          // they never match an email code and get swept by the expiry cleanup.
          const { count } = await supabase
            .from('admin_login_codes')
            .select('id', { count: 'exact', head: true })
            .eq('code_hash', PASSWORD_FAILURE_MARKER)
            .gt('created_at', new Date(now - PASSWORD_LOCKOUT_MS).toISOString());
          if ((count ?? 0) >= PASSWORD_MAX_FAILURES) return null;

          // Compare digests so the check takes the same time for any guess.
          if ((await hashCode(password)) === (await hashCode(adminPassword))) {
            const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
            return { id: 'admin', email: email || adminEmail, remember };
          }

          await supabase.from('admin_login_codes').insert({
            code_hash: PASSWORD_FAILURE_MARKER,
            expires_at: new Date(now + PASSWORD_LOCKOUT_MS).toISOString(),
            used_at: new Date(now).toISOString(),
          });
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
