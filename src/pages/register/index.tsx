/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { themeAtom } from "@/utils/atoms";
import { User } from "@prisma/client";
import { useAtom } from "jotai";
import { signIn } from "next-auth/react";
import { redirect } from "next/dist/server/api-utils";
import Link from "next/link";
import React, { type FormEvent } from "react";

const Register = (props) => {
  const [errors, setErrors] = React.useState<unknown>();
  const [theme] = useAtom(themeAtom);

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    const email = data.get("mail");
    const username = data.get("username");
    const password = data.get("password");
    const confirmPassword = data.get("confirm-password");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        username,
        password,
        confirmPassword,
      }),
    });
    const userInfo = await res.json();
    if (res.status === 200) {
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
      });
    } else {
      setErrors(userInfo);
    }
  }

  return (
    <div
      className="flex h-screen items-center justify-center bg-gradient-to-b from-base-100 to-base-300"
      data-theme={theme == "fantasy" ? "fantasy" : "night"}
    >
      <form
        onSubmit={handleFormSubmit}
        action=""
        className="form-control w-full max-w-xs flex-col gap-5 rounded-lg bg-base-100 p-10"
      >
        <div className="form-control w-full max-w-xs ">
          <label className="label" htmlFor="mail">
            <span className="label-text">E-Mail</span>
          </label>
          <input
            type="text"
            name="mail"
            placeholder="Enter your E-Mail"
            className="input input-bordered w-full max-w-xs"
          />
        </div>
        <div className="form-control w-full max-w-xs ">
          <label className="label" htmlFor="username">
            <span className="label-text">Username</span>
          </label>
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            className="input input-bordered w-full max-w-xs"
          />
        </div>
        <div className="form-control w-full max-w-xs ">
          <label className="label" htmlFor="password">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter your Password"
            className="input input-bordered w-full max-w-xs"
          />
        </div>
        <div className="form-control w-full max-w-xs ">
          <label className="label" htmlFor="password">
            <span className="label-text">Confirm Password</span>
          </label>
          <input
            type="password"
            name="confirm-password"
            placeholder="Enter your Confirm Password"
            className="input input-bordered w-full max-w-xs"
          />
        </div>
        <p className="text-red-500">{errors as string}</p>
        <button
          type="submit"
          className="rounded-full bg-primary py-3 text-primary-content hover:bg-primary-focus"
        >
          Register
        </button>
        <Link
          href={"/login"}
          className="rounded-full bg-primary py-3 text-center text-primary-content hover:bg-primary-focus"
        >
          Login
        </Link>
      </form>
    </div>
  );
};

export default Register;
