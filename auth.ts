import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma/prisma";
import authConfig from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    async session({ session, token }) {
      // With 'jwt' strategy, the 'token' object is always available and reliable.
      // The 'user' object is only present on the very first session call after sign-in.
      // So, we prioritize getting the ID from the token.
      if (token?.id) {
        session.user.id = token.id as string; // Assign the ID from the token to the session
      }
      // You can also add other user properties from the token if you populate them in the jwt callback
      if (token?.email) {
        session.user.email = token.email as string;
      }
      if (token?.name) {
        session.user.name = token.name as string;
      }
      if (token?.picture) {
        // Assuming 'picture' is used for image URL in JWT
        session.user.image = token.picture as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      // This callback runs when a JWT is created or updated.
      // 'user' is the database user object (from the adapter) on initial sign-in.
      if (user) {
        token.id = user.id; // <--- This crucial line populates the 'id' into the JWT token payload
        token.email = user.email; // Also good to add for session.user.email
        token.name = user.name;
        token.picture = user.image; // Assuming 'image' property from User model
      }
      // If you need to pass provider-specific tokens (like access_token)
      // to the client, you can add them to the token here.
      return token;
    },
  },
});
