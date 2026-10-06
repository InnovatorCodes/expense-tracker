import type { NextAuthConfig } from "next-auth";

// Edge-safe config shared by the proxy and the full Auth.js instance in auth.ts
// (no database adapter or bcrypt here). The callbacks live here so the proxy
// sees the same session shape, including `user.id`, as server code does.
export default {
  providers: [],
  pages: {
    signIn: "/auth/login",
    // OAuth failures (e.g. OAuthAccountNotLinked) land on the login page with ?error=
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only present on the initial sign-in.
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (typeof token.id === "string") session.user.id = token.id;
      if (token.email) session.user.email = token.email;
      if (token.name) session.user.name = token.name;
      if (token.picture) session.user.image = token.picture;
      return session;
    },
  },
} satisfies NextAuthConfig;
