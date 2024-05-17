"use server";

import { db } from "@/server/db";
import bcrypt from "bcrypt";

export async function registerUser(e: React.FormEvent<HTMLFormElement>) {
  const formData = new FormData(e.currentTarget);
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        username,
        email,
        password: hashedPassword,
      },
    });
  } catch (error) {
    console.error(error);
  }
}
