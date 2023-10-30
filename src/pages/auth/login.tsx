import { Input } from "@nextui-org/react";
import { Mail, Lock } from "lucide-react";
import { signIn } from "next-auth/react";
import React, { useState } from "react";

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  function handleLogin() {
    void signIn("credentials", {
      email: loginData.email,
      password: loginData.password,
      callbackUrl: `${window.location.origin}/tasks`,
      redirect: false,
    })
      .then((res) => {
        if (!res) {
          return;
        }
        if (res.error == "CredentialsSignin") {
          setError("Invalid Credentials");
        }
      })
      .catch((err) => {
        console.log("rejected: ", err);
        setError("Someting went wrong");
      });
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="rounded-lg p-14">
        <div className="mb-4 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold">Login</div>
        </div>
        <div className="flex flex-col gap-4">
          <Input
            autoFocus
            endContent={
              <Mail className="pointer-events-none flex-shrink-0 text-2xl text-default-400" />
            }
            label="Email"
            placeholder="Enter your email"
            variant="bordered"
            defaultValue={loginData.email}
            onChange={(e) => {
              setLoginData({ ...loginData, email: e.target.value });
            }}
          />
          <Input
            endContent={
              <Lock className="pointer-events-none flex-shrink-0 text-2xl text-default-400" />
            }
            label="Password"
            placeholder="Enter your password"
            type="password"
            variant="bordered"
            defaultValue={loginData.password}
            onChange={(e) => {
              setLoginData({ ...loginData, password: e.target.value });
            }}
          />
          {error && (
            <span className="-m-2 ml-2 font-nunito text-sm text-danger-500">
              {error}
            </span>
          )}
        </div>
        <button
          type="button"
          className="mt-5 w-full rounded-md bg-blue-500 px-3 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={handleLogin}
        >
          Login
        </button>
        {/* <div className="mt-5 flex items-center justify-center">
          <div className="h-px w-full bg-gray-300"></div>
          <div className="mx-2 text-gray-500">Or login with</div>
          <div className="h-px w-full bg-gray-300"></div>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
