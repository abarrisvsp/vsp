import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    /** Absolute sign-in deadline (ms epoch); enforced in middleware. */
    absExp?: number;
    user: {
      isAdmin?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    /** Whether the user chose "stay signed in"; drives session length. */
    remember?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isAdmin?: boolean;
    /** Absolute sign-in deadline (ms epoch). */
    absExp?: number;
  }
}
