"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/home",
      });
    } catch (error) {
      setError("Invalid email or password");
    }
  }

  return (
    <form
      onSubmit={handleLogin}
      className="flex h-full w-2/4 flex-col items-center justify-center gap-4"
    >
      <div className="flex w-full flex-col">
        <label htmlFor="username">Username</label>
        <Input
          type="username"
          id="username"
          name="username"
          placeholder="username"
        />
      </div>
      <div className="flex w-full flex-col">
        <label htmlFor="password">Password</label>
        <Input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          placeholder="********"
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="-mt-[7.6%] mr-2 self-end md:-mt-[4.7%]"
        >
          {showPassword ? <IconEye size={20} /> : <IconEyeOff size={20} />}
        </button>
      </div>
      {error && <p className="py-1 text-red-500">{error}</p>}
      <div className="flex w-full justify-between">
        <Link href={"/auth/register"}>
          Don&apos;t have a account? Create new!
        </Link>
        <button
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          type="submit"
        >
          Login
        </button>
      </div>
    </form>
  );
}
