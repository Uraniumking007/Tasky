"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { UserDropdownMenu } from "./user-dropdown";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import type { User } from "next-auth";
import { getUserPermissions } from "@/lib/permissions";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [permissions, setPermissions] = useState();

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchPermissions() {
      if (session?.user) {
        const res = await fetch("/api/permissions");
        if (res.ok) {
          setPermissions(await res.json());
        }
      }
    }
    fetchPermissions();
  }, [session?.user]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-border/50 bg-background/80 shadow-lg backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-2">
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Tasky Logo"
                width={40}
                height={40}
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-xl font-bold text-transparent">
              Tasky
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            {session?.user ? (
              // Authenticated user navigation
              <>
                <Link
                  href="/home"
                  className="text-sm font-medium text-foreground/80 transition-colors duration-200 hover:text-primary"
                >
                  Dashboard
                </Link>
                <Link
                  href="/manage-workspace"
                  className="text-sm font-medium text-foreground/80 transition-colors duration-200 hover:text-primary"
                >
                  Workspace
                </Link>
                <Link
                  href="/tasks"
                  className="text-sm font-medium text-foreground/80 transition-colors duration-200 hover:text-primary"
                >
                  Tasks
                </Link>
                <div className="flex items-center space-x-4">
                  <UserDropdownMenu
                    user={session.user as User}
                    teamName={session.user.active_team || session.user.username}
                    permissions={permissions}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-foreground/80 hover:bg-primary/10 hover:text-primary"
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              // Unauthenticated user navigation
              <>
                <Link
                  href="#features"
                  className="text-sm font-medium text-foreground/80 transition-colors duration-200 hover:text-primary"
                >
                  Features
                </Link>
                <Link
                  href="#pricing"
                  className="text-sm font-medium text-foreground/80 transition-colors duration-200 hover:text-primary"
                >
                  Pricing
                </Link>
                <div className="flex items-center space-x-3">
                  <Link href="/auth/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-foreground/80 hover:bg-primary/10 hover:text-primary"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:bg-primary/90 hover:shadow-xl"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 rounded-b-lg border-t border-border/50 bg-background/95 px-2 pb-3 pt-2 shadow-xl backdrop-blur-md">
              {session?.user ? (
                // Authenticated mobile menu
                <>
                  <Link
                    href="/home"
                    className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/manage-workspace"
                    className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Workspace
                  </Link>
                  <Link
                    href="/tasks"
                    className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Tasks
                  </Link>
                  <div className="mt-2 border-t border-border/50 pt-2">
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Signed in as {session.user.username}
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-foreground/80 transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                // Unauthenticated mobile menu
                <>
                  <Link
                    href="#features"
                    className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="#pricing"
                    className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <div className="mt-2 space-y-2 border-t border-border/50 pt-2">
                    <Link href="/auth/login">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-foreground/80 hover:bg-primary/10 hover:text-primary"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button
                        size="sm"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
