/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db";
import bcrypt from "bcryptjs";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  switch (method) {
    case "GET":
      break;
    case "POST":
      await post(req, res);
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default handler;

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { email, password, username, confirmPassword } = req.body as {
    email: string;
    password: string;
    username: string;
    confirmPassword: string;
  };
  if (password !== confirmPassword) {
    res.status(400).json({ error: "Passwords do not match" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  if (username.length < 3) {
    res.status(400).json({ error: "Username must be at least 3 characters" });
    return;
  }
  if (email.length < 3) {
    res.status(400).json({ error: "Email is Invalid" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
      username,
    },
  });

  if (existingUser) {
    res.status(400).json({ error: "User already exists" });
    return;
  }

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email,
      username,
      password: hashedPassword,
    },
  });

  res.status(200).json({ user });
}
