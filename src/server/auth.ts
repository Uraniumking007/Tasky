import NextAuth, { User } from "next-auth";
import { authOptions } from "./auth.config";
import bcrypt from "bcryptjs";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import Auth0 from "next-auth/providers/auth0";
import { db } from "./db";
import { env } from "@/env";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
      authorization: {
        params: {
          scope: "read:user",
        },
      },
      profile: async (profile): Promise<User> => {
        console.log(profile);
        console.log(profile.email);

        if (profile.email === null) {
          return {
            id: profile.id.toString(),
            name: profile.name,
            email: profile.email,
            image: profile.avatar_url,
          };
        }
        const user = await db.user.findFirst({
          where: {
            email: profile.email,
          },
        });
        console.log(user);

        if (user) {
          // redirect("/auth/login");
        }
        const newUser = await db.user.create({
          data: {
            id: profile.id.toString(),
            name: profile.name,
            email: profile.email,
            avatar_url: profile.avatar_url,
            active_team: profile.login,
            username: profile.login,
          },
        });
        return {
          active_team: newUser.active_team,
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          image: newUser.avatar_url,
          username: newUser.username!,
        };
      },
    }),
    Discord,
    Google,
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req): Promise<User | null> {
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

        if (!user.password) {
          throw new Error("Password Not Created");
        }

        const isValid = bcrypt.compare(password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          ...user,
          username: user.username || undefined,
        };
      },
    }),
  ],
  ...authOptions,
});
