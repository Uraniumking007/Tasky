"use client";

import { Input } from "@/components/ui/input";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";

export default function RegistrationForm({
  registerUser,
}: {
  registerUser: (
    prevState: object,
    formData: FormData,
  ) => Promise<{ message: string; statusCode: number }>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, formAction] = useFormState(registerUser, {
    message: "",
    statusCode: 0,
  });
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (status?.statusCode === 200) {
      toast({
        description: "Registration Successful",
      });
      router.push("/auth/login");
    } else {
      setError(status?.message);
    }
  }, [status, router, toast]);

  return (
    <form
      action={formAction}
      className="flex h-full w-2/4 flex-col items-center justify-center gap-4"
    >
      <div className="flex w-full flex-col">
        <label htmlFor="name">Name</label>
        <Input type="text" id="name" name="name" placeholder="Name" />
      </div>
      <div className="flex w-full flex-col">
        <label htmlFor="username">Username</label>
        <Input
          type="text"
          id="username"
          name="username"
          placeholder="username"
        />
      </div>

      <div className="flex w-full flex-col">
        <label htmlFor="email">Email</label>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder="yourmail@mail.com"
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
          className="-mt-[4.7%] mr-2 self-end"
        >
          {showPassword ? <IconEye size={20} /> : <IconEyeOff size={20} />}
        </button>
      </div>
      <div>{error && <p className="py-2 text-red-500">{error}</p>}</div>
      <div className="flex w-full justify-between">
        <Link className="text-foreground" href={"/auth/login"}>
          Already have a account? Sign in
        </Link>
        <button
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          type="submit"
        >
          Register
        </button>
      </div>
    </form>
  );
}
