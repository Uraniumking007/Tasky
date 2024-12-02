"use server";

import { signIn } from "@/server/auth";
import { db } from "@/server/db";
import bcrypt from "bcryptjs";

export async function registerUser(prevState: object, formData: FormData) {
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !username || !email || !password) {
    return {
      message: "Please fill all fields",
      statusCode: 400,
    };
  }

  if (username.length < 3) {
    return {
      message: "Username must be at least 3 characters long",
      statusCode: 400,
    };
  }

  if (name.length < 3) {
    return {
      message: "Name must be at least 3 characters long",
      statusCode: 400,
    };
  }

  if (password.length < 6) {
    return {
      message: "Password must be at least 6 characters long",
      statusCode: 400,
    };
  }

  if (!email.includes("@")) {
    return {
      message: "Invalid email",
      statusCode: 400,
    };
  }

  if (await db.user.findUnique({ where: { username } })) {
    return {
      message: "User with this username already exists",
      statusCode: 400,
    };
  }

  if (await db.user.findUnique({ where: { email } })) {
    return {
      message: "User with this email already exists",
      statusCode: 400,
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await db.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        username,
        email,
        password: hashedPassword,
      },
    });
    const team = await db.team.create({
      data: {
        id: crypto.randomUUID(),
        name: "Personal",
        ownerId: user.id,
      },
    });

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        active_team: team.id,
      },
    });
  } catch (error) {
    console.error(error);
    return {
      message: (error as Error).message
        ? "Something went wrong!"
        : "Something went wrong!",
      statusCode: 401,
    };
  }
  return {
    message: "User created successfully",
    statusCode: 200,
  };
}

export async function oAuth(
  method: "github" | "google" | "discord" | "custom-github",
) {
  if (method === "custom-github") {
    await signIn("custom-github");
  }
  if (method === "github") {
    await signIn("github");
  }
  if (method === "discord") {
    await signIn("discord");
  }
  if (method === "google") {
    await signIn("google");
  }
}