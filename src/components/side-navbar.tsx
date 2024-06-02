"use client";
import React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { User } from "next-auth";
import { signOut } from "next-auth/react";
import { UserDropdownMenu } from "./user-dropdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { CalendarCheck, LayoutDashboard } from "lucide-react";

export default function SideNavbar({ user }: { user: User | null }) {
  return (
    <div className="flex w-48 flex-col justify-between p-2">
      <div className="flex w-full flex-col gap-2">
        <UserDropdownMenu user={user} />
        <Accordion type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger className="gap-1">
              <LayoutDashboard size={12} />
              Dashboard
            </AccordionTrigger>
            <AccordionContent>
              <Button variant="ghost">Inbox</Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Accordion type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger className="gap-1">
              <CalendarCheck size={12} />
              Tasks
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex w-full flex-col gap-2">
                <Link href={"/tasks"}>All</Link>
                <Link href={"/tasks/pending"}>Pending</Link>
                <Link href={"/tasks/ongoing"}>Ongoing</Link>
                <Link href={"/tasks/completed"}>Completed</Link>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      {user ? (
        <Button
          onClick={() => {
            signOut({ callbackUrl: "/" });
          }}
        >
          Logout
        </Button>
      ) : (
        <Link href={"/auth/login"}>
          <Button>Get Started</Button>
        </Link>
      )}
    </div>
  );
}
