import { authOptions } from "@/server/auth.config";
import NextAuth from "next-auth";

export const { auth: middleware } = NextAuth(authOptions);
