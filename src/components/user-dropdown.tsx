import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User as UserLogo,
  UserPlus,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "next-auth";
import { cn } from "@/lib/utils";

export function UserDropdownMenu({
  user,
  teamName,
  isCollapsed = false,
  permissions,
}: {
  user: User | null;
  teamName: string;
  isCollapsed?: boolean;
  permissions?: import("@/lib/permissions").UserPermissions;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:bg-background/80",
            isCollapsed ? "w-full justify-center px-2" : "w-full",
          )}
        >
          {!isCollapsed && <span className="truncate">{teamName}</span>}
          {isCollapsed && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {teamName.charAt(0).toUpperCase()}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 border-border/50 bg-background/95 backdrop-blur-md">
        <DropdownMenuLabel className="text-foreground">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuGroup>
          <DropdownMenuItem className="transition-colors duration-200 hover:bg-primary/10 hover:text-primary">
            <UserLogo className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem className="transition-colors duration-200 hover:bg-primary/10 hover:text-primary">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem className="transition-colors duration-200 hover:bg-primary/10 hover:text-primary">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem className="transition-colors duration-200 hover:bg-primary/10 hover:text-primary">
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Keyboard shortcuts</span>
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border/50" />
        {permissions?.hasTeamAccess || permissions?.hasOrganizationAccess ? (
          <DropdownMenuGroup>
            {permissions?.hasTeamAccess && (
              <DropdownMenuItem className="transition-colors duration-200 hover:bg-primary/10 hover:text-primary">
                <Users className="mr-2 h-4 w-4" />
                <span>Team</span>
              </DropdownMenuItem>
            )}
            {permissions?.hasTeamAccess && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="transition-colors duration-200 hover:bg-primary/10 hover:text-primary">
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Invite users</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="border-border/50 bg-background/95 backdrop-blur-md">
                    <DropdownMenuItem className="transition-colors duration-200 hover:bg-primary/10 hover:text-primary">
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Email</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="transition-colors duration-200 hover:bg-primary/10 hover:text-primary">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Message</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem className="transition-colors duration-200 hover:bg-primary/10 hover:text-primary">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span>More...</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )}
            {permissions?.hasTeamAccess && (
              <DropdownMenuItem className="transition-colors duration-200 hover:bg-primary/10 hover:text-primary">
                <Plus className="mr-2 h-4 w-4" />
                <span>New Team</span>
                <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
              </DropdownMenuItem>
            )}
            {permissions?.hasOrganizationAccess && (
              <DropdownMenuItem className="transition-colors duration-200 hover:bg-primary/10 hover:text-primary">
                <Users className="mr-2 h-4 w-4" />
                <span>Organization</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        ) : null}
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem className="transition-colors duration-200 hover:bg-primary/10 hover:text-primary">
          <Github className="mr-2 h-4 w-4" />
          <span>GitHub</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="transition-colors duration-200 hover:bg-primary/10 hover:text-primary">
          <LifeBuoy className="mr-2 h-4 w-4" />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="opacity-50">
          <Cloud className="mr-2 h-4 w-4" />
          <span>API</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
