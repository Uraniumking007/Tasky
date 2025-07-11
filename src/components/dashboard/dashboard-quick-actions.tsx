"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconPlus,
  IconList,
  IconUsers,
  IconBuilding,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";

export function DashboardQuickActions() {
  return (
    <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
          <IconPlus className="h-5 w-5 lg:h-6 lg:w-6" />
          Quick Actions
        </CardTitle>
        <CardDescription className="text-sm lg:text-base">
          Create new tasks or manage your workflow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          asChild
          className="h-12 w-full bg-primary text-base hover:bg-primary/90 lg:h-14 lg:text-lg"
        >
          <Link href="/tasks">
            <IconPlus className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
            Create New Task
          </Link>
        </Button>
        <Button
          variant="outline"
          asChild
          className="h-12 w-full text-base lg:h-14 lg:text-lg"
        >
          <Link href="/tasks">
            <IconList className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
            View All Tasks
          </Link>
        </Button>
        <Button
          variant="outline"
          asChild
          className="h-12 w-full text-base lg:h-14 lg:text-lg"
        >
          <Link href="/manage-workspace">
            <IconUsers className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
            Manage Teams
          </Link>
        </Button>
        <Button
          variant="outline"
          asChild
          className="h-12 w-full text-base lg:h-14 lg:text-lg"
        >
          <Link href="/manage-workspace">
            <IconBuilding className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
            Manage Organizations
          </Link>
        </Button>
        <Button
          variant="outline"
          asChild
          className="h-12 w-full text-base lg:h-14 lg:text-lg"
        >
          <Link href="/settings">
            <IconSettings className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
            Settings
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
