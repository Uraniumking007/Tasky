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

export default function Navbar() {
  return (
    <div className="shadow-nav w-full shadow-current ">
      <NavigationMenu>
        <NavigationMenuList>
          <Image src={"/logo.png"} alt="logo" width={64} height={64} />
          <NavigationMenuItem>
            <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Link</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Item Two</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Link</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <Button>Get Started</Button>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
