"use server";

import { db } from "@/server/db";
import bcrypt from "bcrypt";

export async function registerUser(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log(formData);

  console.log(name, username, email, password);

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
        ? "User already Exists"
        : "Something went wrong!",
      statusCode: 401,
    };
  }
  return {
    message: "User created successfully",
    statusCode: 200,
  };
}
