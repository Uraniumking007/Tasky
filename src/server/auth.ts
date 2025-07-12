import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import DiscordProvider from "next-auth/providers/discord";
import bcrypt from "bcrypt";
import { env } from "@/env";
import { db } from "@/server/db";
import Credentials from "next-auth/providers/credentials";
import { CustomUser } from "@/lib/types/auth";

declare module "next-auth" {
  export interface User extends CustomUser {}
  export interface Session extends DefaultSession {
    user: CustomUser & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.username = user.username;

        return {
          ...token,
          username: user.username,
          active_team: user.active_team,
        };
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        username: token.username,
        active_team: token.active_team,
      },
    }),
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, _req) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _request = _req;
        const { username, password } = credentials!;
        const user = await db.users.findFirst({
          where: {
            username: username.toLowerCase(),
          },
        });

        if (!user?.username || !user.email || !user.password) {
          throw new Error("No user found");
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.name ?? user.username,
          email: user.email,
          username: user.username,
          active_team: user.active_team,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
