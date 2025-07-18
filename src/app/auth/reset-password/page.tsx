"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  IconEye,
  IconEyeOff,
  IconLock,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || null;

  // Validate token on component mount
  const {
    data: tokenValidation,
    isLoading: isValidating,
    error: validationError,
  } = api.users.validateResetToken.useQuery(
    { token: token || "" },
    {
      enabled: !!token,
      retry: false,
    },
  );

  const resetPasswordMutation = api.users.resetPassword.useMutation({
    onSuccess: (data) => {
      setIsSuccess(true);
      toast({
        title: "Password reset successful! ✅",
        description: data.message,
      });
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter a new password.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "Invalid reset link",
        description: "This reset link is invalid. Please request a new one.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    resetPasswordMutation.mutate({ token, password });
  };

  // Show loading state while validating token
  if (isValidating) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!token || validationError || !tokenValidation?.valid) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-red-500/5 p-4 sm:p-6">
        <div className="relative w-full max-w-sm sm:max-w-md">
          <div className="relative rounded-2xl border border-border/50 bg-background/80 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-red-500/10 p-3">
                  <IconX className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                Invalid Reset Link
              </h1>
              <p className="mt-2 px-2 text-sm text-muted-foreground">
                {tokenValidation?.message ||
                  "This password reset link is invalid or has expired."}
              </p>

              <div className="mt-6 space-y-4">
                <Button asChild className="w-full">
                  <Link href="/auth/forgot-password">
                    Request New Reset Link
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth/login">Back to Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (isSuccess) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-green-500/5 p-4 sm:p-6">
        <div className="relative w-full max-w-sm sm:max-w-md">
          <div className="relative rounded-2xl border border-border/50 bg-background/80 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-green-500/10 p-3">
                  <IconCheck className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                Password Reset Complete!
              </h1>
              <p className="mt-2 px-2 text-sm text-muted-foreground">
                Your password has been successfully reset. You can now log in
                with your new password.
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Redirecting to login page in a few seconds...
              </p>

              <div className="mt-6">
                <Button asChild className="w-full">
                  <Link href="/auth/login">Continue to Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6">
      <div className="relative w-full max-w-sm sm:max-w-md">
        {/* Background Elements */}
        <div className="absolute inset-0 hidden rounded-3xl bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-3xl sm:block" />
        <div className="absolute -left-4 -top-4 hidden h-24 w-24 rounded-full bg-primary/20 blur-2xl sm:block" />
        <div className="absolute -bottom-4 -right-4 hidden h-32 w-32 rounded-full bg-primary/15 blur-2xl sm:block" />

        {/* Form Container */}
        <div className="relative rounded-2xl border border-border/50 bg-background/80 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
          {/* Header */}
          <div className="mb-6 text-center sm:mb-8">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
                <IconLock className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              Reset Your Password
            </h1>
            <p className="mt-2 px-2 text-xs text-muted-foreground sm:text-sm">
              {tokenValidation?.user?.email && (
                <>
                  Resetting password for{" "}
                  <strong>{tokenValidation.user.email}</strong>
                </>
              )}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* New Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                New Password
              </label>
              <div className="relative">
                <IconLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="h-12 border-border/50 bg-background/50 pl-10 pr-12 text-base transition-all duration-200 focus:border-primary/50 focus:bg-background/80 sm:h-11"
                  required
                  minLength={8}
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
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <IconLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="h-12 border-border/50 bg-background/50 pl-10 pr-12 text-base transition-all duration-200 focus:border-primary/50 focus:bg-background/80 sm:h-11"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 touch-manipulation p-1 text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <IconEye size={20} />
                  ) : (
                    <IconEyeOff size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full touch-manipulation rounded-lg bg-primary text-base font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span>Resetting Password...</span>
                </div>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 border-t border-border/50 pt-4 sm:mt-8 sm:pt-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="touch-manipulation text-primary transition-colors duration-200 hover:text-primary/80"
                >
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
