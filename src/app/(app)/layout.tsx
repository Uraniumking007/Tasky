import Navbar from "@/components/navbar";
import { ReactNode } from "react";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}
