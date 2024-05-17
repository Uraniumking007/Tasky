"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { signIn } from "next-auth/react";
import { registerUser } from "./action";
import Link from "next/link";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={registerUser}
      className="flex h-full w-2/4 flex-col items-center justify-center gap-4"
    >
      <div className="flex w-full flex-col">
        <label htmlFor="name">Name</label>
        <Input type="text" id="name" placeholder="Name" />
      </div>
      <div className="flex w-full flex-col">
        <label htmlFor="username">Username</label>
        <Input type="text" id="username" placeholder="username" />
      </div>

      <div className="flex w-full flex-col">
        <label htmlFor="email">Email</label>
        <Input type="email" id="email" placeholder="yourmail@mail.com" />
      </div>
      <div className="flex w-full flex-col">
        <label htmlFor="password">Password</label>
        <Input
          type={showPassword ? "text" : "password"}
          id="password"
          placeholder="********"
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="-mt-[4.7%] mr-2 self-end"
        >
          {showPassword ? <IconEye size={20} /> : <IconEyeOff size={20} />}
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex w-full justify-between">
        <Link className="text-foreground" href={"/auth/login"}>
          Already have a account? Sign in
        </Link>
        <button
          className="bg-primary text-primary-foreground rounded-md px-4 py-2"
          type="submit"
        >
          Register
        </button>
      </div>
    </form>
  );
}
