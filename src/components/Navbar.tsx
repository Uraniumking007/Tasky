import React from "react";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  useDisclosure,
  Button,
} from "@nextui-org/react";
import { signOut, useSession } from "next-auth/react";
import LoginModal from "./loginModal";
import ThemeSwitcher from "./themeSwitcher";

export default function App() {
  const { data, status } = useSession();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  if (status === "loading") {
    return null;
  }
  function handleSignOut() {
    void signOut();
  }

  return (
    <Navbar maxWidth="full">
      <NavbarBrand>
        <p className="font-bold text-inherit">TASKY</p>
      </NavbarBrand>
      <NavbarContent as="div" justify="end">
        <ThemeSwitcher />
        {data?.user ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                name="Jason Hughes"
                size="sm"
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{data.user.email}</p>
              </DropdownItem>
              <DropdownItem key="settings">My Settings</DropdownItem>
              <DropdownItem key="team_settings">Team Settings</DropdownItem>
              <DropdownItem key="analytics">Analytics</DropdownItem>
              <DropdownItem key="system">System</DropdownItem>
              <DropdownItem key="configurations">Configurations</DropdownItem>
              <DropdownItem key="help_and_feedback">
                Help & Feedback
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onClick={handleSignOut}>
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <LoginModal />
        )}
      </NavbarContent>
    </Navbar>
  );
}
