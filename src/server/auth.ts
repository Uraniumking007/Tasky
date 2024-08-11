import NextAuth from "next-auth";
import { authOptions } from "./auth.config";
import bcrypt from "bcryptjs";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import { env } from "@/env";
import { db } from "./db";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GitHub,
    Discord,
    Google,
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };
        const user = await db.user.findFirst({
          where: {
            username,
          },
        });

        if (!user) {
          throw new Error("No user found");
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return user ? user : null;
      },
    }),
  ],
  ...authOptions,
});
