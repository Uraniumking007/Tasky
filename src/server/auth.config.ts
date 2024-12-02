import { PrismaAdapter } from "@auth/prisma-adapter";
import { env } from "@/env";
import { db } from "@/server/db";
import { DefaultSession, NextAuthConfig, Session } from "next-auth";

declare module "next-auth" {
  interface User {
    username?: string;
    email?: string | null | undefined;
    active_team?: string | null;
  }
  interface Session extends DefaultSession {
    user: {
      username: string;
      email: string;
      active_team: string | null;
    } & DefaultSession["user"];
  }
}

export const authOptions: Partial<NextAuthConfig> = {
  secret: env.AUTH_SECRET,
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
    session: ({ session, token }: { session: Session; token: any }) => ({
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
  adapter: PrismaAdapter(db),
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  debug: true,
};
