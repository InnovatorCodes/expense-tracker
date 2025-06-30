import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { NextAuthConfig } from "next-auth";
import { loginSchema } from "./schemas/authentication-schema";
import { prisma } from "./prisma/prisma";
import bcrypt from "bcryptjs";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedData = loginSchema.safeParse(credentials);
        if (!validatedData.success) return null;
        const { email, password } = validatedData.data;
        const user = await prisma.user.findFirst({
          where: {
            email: email,
          },
        });
        if (!user || !user.password || !user.email) return null;
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (passwordsMatch) {
          return user;
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
