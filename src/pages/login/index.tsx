/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { themeAtom } from "@/utils/atoms";
import { useAtom } from "jotai";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import React, { useState, type FormEvent } from "react";

const Index = (props) => {
  const [theme] = useAtom(themeAtom);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    const email = data.get("floating_email");
    const password = data.get("floating_password");
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/",
    });
    console.log(email, password);
  }
  return (
    <div
      className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-base-100 to-base-300"
      data-theme={theme == "fantasy" ? "fantasy" : "night"}
    >
      <form
        onSubmit={handleFormSubmit}
        action=""
        className="form-control w-full max-w-xs flex-col gap-5 rounded-lg bg-base-100 p-10"
      >
        {" "}
        <legend className="text-center font-nunito text-2xl font-bold">
          Login
        </legend>
        <div className="group relative z-0 mb-6 w-full">
          <input
            type="email"
            name="floating_email"
            id="floating_email"
            className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-base-content  focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
            placeholder=" "
            required
          />
          <label
            htmlFor="floating_email"
            className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500"
          >
            Email <span className="text-red-500">*</span>
          </label>
        </div>
        <div className="group relative z-0 mb-6 w-full">
          <input
            type={showPassword ? "text" : "password"}
            name="floating_password"
            id="floating_password"
            className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-base-content focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
            placeholder=" "
            required
          />
          <label
            htmlFor="floating_password"
            className="absolute top-3 -z-10 w-full origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500"
          >
            Password <span className="text-red-500">*</span>
          </label>
          <div className="absolute right-3 top-4">
            {showPassword ? (
              <Eye
                onClick={() => setShowPassword(!showPassword)}
                size={"20px"}
              />
            ) : (
              <EyeOff
                onClick={() => setShowPassword(!showPassword)}
                size={"20px"}
              />
            )}
          </div>
        </div>
        <button
          type="submit"
          className="select-none rounded-full bg-primary py-3 text-primary-content focus:bg-primary-focus"
        >
          Login
        </button>
        <Link href={"/register"}>
          <button className="w-full select-none rounded-full bg-primary py-3 text-primary-content focus:bg-primary-focus">
            Register
          </button>
        </Link>
      </form>
    </div>
  );
};

export default Index;
