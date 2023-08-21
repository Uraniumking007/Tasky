/* eslint-disable @typescript-eslint/no-misused-promises */
import { signIn } from "next-auth/react";
import React, { type FormEvent } from "react";

const Index = (props) => {
  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    const email = data.get("username");
    const password = data.get("password");
    await signIn("credentials", {
      email: email,
      password: password,
      callbackUrl: "/",
    });
    console.log(email, password);
  }
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-base-100 to-base-300">
      <form
        onSubmit={handleFormSubmit}
        action=""
        className="form-control w-full max-w-xs flex-col gap-5 rounded-lg bg-base-100 p-10"
      >
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
        <button
          type="submit"
          className="rounded-full bg-primary py-3 text-primary-content focus:bg-primary-focus"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Index;
