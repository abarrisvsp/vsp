import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        if (email.toLowerCase() !== (process.env.ADMIN_EMAIL || '').toLowerCase()) {
          return null;
        }
        const valid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH || '');
        if (!valid) return null;

        return { id: 'admin', email, name: 'Aaron' };
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.isAdmin = true;
      return token;
    },
    session({ session, token }) {
      if (token?.isAdmin) session.user.isAdmin = true;
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
