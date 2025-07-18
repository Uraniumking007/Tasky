"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconMail, IconArrowLeft, IconCheck } from "@tabler/icons-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const forgotPasswordMutation = api.users.forgotPassword.useMutation({
    onSuccess: (data) => {
      setIsSuccess(true);
      toast({
        title: "Email sent! 📧",
        description: data.message,
      });
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

    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    forgotPasswordMutation.mutate({ email: email.trim().toLowerCase() });
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6">
        <div className="relative w-full max-w-sm sm:max-w-md">
          {/* Background Elements */}
          <div className="absolute inset-0 hidden rounded-3xl bg-gradient-to-r from-green-500/10 via-transparent to-green-500/10 blur-3xl sm:block" />
          <div className="absolute -left-4 -top-4 hidden h-24 w-24 rounded-full bg-green-500/20 blur-2xl sm:block" />
          <div className="absolute -bottom-4 -right-4 hidden h-32 w-32 rounded-full bg-green-500/15 blur-2xl sm:block" />

          {/* Success Container */}
          <div className="relative rounded-2xl border border-border/50 bg-background/80 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-green-500/10 p-3">
                  <IconCheck className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                Check Your Email
              </h1>
              <p className="mt-2 px-2 text-sm text-muted-foreground">
                We&apos;ve sent password reset instructions to{" "}
                <strong>{email}</strong>
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                The email may take a few minutes to arrive. Check your spam
                folder if you don&apos;t see it.
              </p>

              <div className="mt-6 space-y-4">
                <Button asChild className="w-full">
                  <Link href="/auth/login">
                    <IconArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                >
                  Send Another Email
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
                <IconMail className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              Forgot Password?
            </h1>
            <p className="mt-2 px-2 text-xs text-muted-foreground sm:text-sm">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="h-12 border-border/50 bg-background/50 pl-10 text-base transition-all duration-200 focus:border-primary/50 focus:bg-background/80 sm:h-11"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
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
                  <span>Sending...</span>
                </div>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            {/* Back to Login */}
            <div className="pt-2 text-center">
              <Link
                href="/auth/login"
                className="inline-flex touch-manipulation items-center gap-2 text-sm font-medium text-primary transition-colors duration-200 hover:text-primary/80"
              >
                <IconArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 border-t border-border/50 pt-4 sm:mt-8 sm:pt-6">
            <div className="space-y-2 text-center">
              <p className="text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/register"
                  className="touch-manipulation text-primary transition-colors duration-200 hover:text-primary/80"
                >
                  Create one here
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                Need help? Contact{" "}
                <Link
                  href="/support"
                  className="touch-manipulation text-primary transition-colors duration-200 hover:text-primary/80"
                >
                  support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
