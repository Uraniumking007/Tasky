"use client";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import type { User } from "next-auth";
import { signOut } from "next-auth/react";
import { UserDropdownMenu } from "./user-dropdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { CalendarCheck, LayoutDashboard } from "lucide-react";

export default function SideNavbar({
  user,
  teamName,
}: {
  user: User | null;
  teamName: string;
}) {
  return (
    <div className="flex w-48 flex-col justify-between p-2">
      <div className="flex w-full flex-col gap-2">
        <UserDropdownMenu user={user} teamName={teamName} />
        <Accordion type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger className="gap-1">
              <LayoutDashboard size={12} />
              Dashboard
            </AccordionTrigger>
            <AccordionContent>
              <Button variant="outline" className="w-full">
                Inbox
              </Button>
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
                <Link href={"/tasks"}>
                  <Button variant="outline" className="w-full">
                    All
                  </Button>
                </Link>
                <Link href={"/tasks/pending"}>
                  <Button variant="outline" className="w-full">
                    Pending
                  </Button>
                </Link>
                <Link href={"/tasks/ongoing"}>
                  <Button variant="outline" className="w-full">
                    Ongoing
                  </Button>
                </Link>
                <Link href={"/tasks/completed"}>
                  <Button variant="outline" className="w-full">
                    Completed
                  </Button>
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      {user ? (
        <Button
          onClick={async () => {
            await signOut({ callbackUrl: "/" });
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
