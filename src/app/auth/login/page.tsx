"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  IconEye,
  IconEyeOff,
  IconUser,
  IconLock,
  IconMail,
} from "@tabler/icons-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        username: username.toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
        setIsLoading(false);
      } else {
        toast({
          title: "Welcome back! 👋",
          description: "Successfully signed in to your account.",
        });
        router.push("/home");
        // Redirect will be handled by NextAuth
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

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
                <IconMail className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              Welcome Back
            </h1>
            <p className="mt-2 px-2 text-xs text-muted-foreground sm:text-sm">
              Sign in to your Tasky account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-foreground"
              >
                Username
              </label>
              <div className="relative">
                <IconUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  className="h-12 border-border/50 bg-background/50 pl-10 text-base transition-all duration-200 focus:border-primary/50 focus:bg-background/80 sm:h-11"
                  required
                  autoComplete="username"
                  disabled={isLoading}
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
                  placeholder="Enter your password"
                  className="h-12 border-border/50 bg-background/50 pl-10 pr-12 text-base transition-all duration-200 focus:border-primary/50 focus:bg-background/80 sm:h-11"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 touch-manipulation p-1 text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
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
                  <span className="hidden sm:inline">Signing In...</span>
                  <span className="sm:hidden">Signing In...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Sign Up Link */}
            <div className="pt-2 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/register"
                  className="touch-manipulation font-medium text-primary transition-colors duration-200 hover:text-primary/80"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 border-t border-border/50 pt-4 sm:mt-8 sm:pt-6">
            <div className="space-y-2 text-center">
              <p className="text-xs text-muted-foreground">
                Having trouble signing in?{" "}
                <Link
                  href="/auth/forgot-password"
                  className="touch-manipulation text-primary transition-colors duration-200 hover:text-primary/80"
                >
                  Reset your password
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                Or contact{" "}
                <Link
                  href="/support"
                  className="touch-manipulation text-primary transition-colors duration-200 hover:text-primary/80"
                >
                  support
                </Link>{" "}
                for help
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
