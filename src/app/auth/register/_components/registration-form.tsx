"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  IconEye,
  IconEyeOff,
  IconUser,
  IconAt,
  IconLock,
  IconMail,
} from "@tabler/icons-react";
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
  const [isLoading, setIsLoading] = useState(false);
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
        title: "Success! 🎉",
        description:
          "Your account has been created successfully. Please sign in.",
      });
      router.push("/auth/login");
    } else if (status?.statusCode !== 0) {
      setError(status?.message);
      setIsLoading(false);
    }
  }, [status, router, toast]);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    formAction(formData);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6">
      <div className="relative w-full max-w-sm sm:max-w-md">
        {/* Background Elements - Hidden on mobile for performance */}
        <div className="absolute inset-0 hidden rounded-3xl bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-3xl sm:block" />
        <div className="absolute -left-4 -top-4 hidden h-24 w-24 rounded-full bg-primary/20 blur-2xl sm:block" />
        <div className="absolute -bottom-4 -right-4 hidden h-32 w-32 rounded-full bg-primary/15 blur-2xl sm:block" />

        {/* Form Container */}
        <div className="relative rounded-2xl border border-border/50 bg-background/80 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
          {/* Header */}
          <div className="mb-6 text-center sm:mb-8">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
                <IconUser className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              Create Account
            </h1>
            <p className="mt-2 px-2 text-xs text-muted-foreground sm:text-sm">
              Join Tasky and start organizing your workflow
            </p>
          </div>

          {/* Form */}
          <form action={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Full Name
              </label>
              <div className="relative">
                <IconUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  className="h-12 border-border/50 bg-background/50 pl-10 text-base transition-all duration-200 focus:border-primary/50 focus:bg-background/80 sm:h-11"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-foreground"
              >
                Username
              </label>
              <div className="relative">
                <IconAt className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Choose a username"
                  className="h-12 border-border/50 bg-background/50 pl-10 text-base transition-all duration-200 focus:border-primary/50 focus:bg-background/80 sm:h-11"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email Address
              </label>
              <div className="relative">
                <IconMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your.email@example.com"
                  className="h-12 border-border/50 bg-background/50 pl-10 text-base transition-all duration-200 focus:border-primary/50 focus:bg-background/80 sm:h-11"
                  required
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <IconLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
                  className="h-12 border-border/50 bg-background/50 pl-10 pr-12 text-base transition-all duration-200 focus:border-primary/50 focus:bg-background/80 sm:h-11"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 touch-manipulation p-1 text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <IconEye size={20} />
                  ) : (
                    <IconEyeOff size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                <p className="text-sm leading-relaxed text-destructive">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full touch-manipulation rounded-lg bg-primary text-base font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span className="hidden sm:inline">Creating Account...</span>
                  <span className="sm:hidden">Creating...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>

            {/* Sign In Link */}
            <div className="pt-2 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="touch-manipulation font-medium text-primary transition-colors duration-200 hover:text-primary/80"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>

          {/* Footer - Simplified for mobile */}
          <div className="mt-6 border-t border-border/50 pt-4 sm:mt-8 sm:pt-6">
            <p className="px-2 text-center text-xs leading-relaxed text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link
                href="/terms"
                className="touch-manipulation text-primary transition-colors duration-200 hover:text-primary/80"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="touch-manipulation text-primary transition-colors duration-200 hover:text-primary/80"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
