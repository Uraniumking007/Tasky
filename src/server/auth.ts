import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import type {
  NextAuthOptions,
  DefaultSession,
  DefaultUser,
  Session,
} from "next-auth";
import bcrypt from "bcryptjs";
import { env } from "@/env.mjs";
import { prisma } from "@/server/db";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { User } from "@prisma/client";
import type { AdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User;
  }
  interface User extends DefaultUser {
    username: string;
  }
}
declare module "next-auth/adapters" {
  interface AdapterUser extends User {
    id: string;
    username: string;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt({ token, user }) {
      // console.log("jwt callback", token, user, session);
      if (user) {
        return {
          ...token,
          id: user.id,
          username: user.username,
        };
      }
      return token;
    },
    session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
      user: AdapterUser;
    }) {
      // console.log("session callback", session, token, user);
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          username: token.username,
        },
      };
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-Mail", placeholder: "user@mail.com", type: "text" },
        password: {
          label: "Password",
          placeholder: "**********",
          type: "password",
        },
      },
      async authorize(credentials) {
        const { email, password } = credentials!;

        const user = await prisma.user.findFirst({
          where: {
            email,
          },
        });

        if (!user) return null;

        if (!user.password) return null;

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return null;

        return user;
      },
    }),
  ],
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
