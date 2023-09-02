import { themeAtom } from "@/utils/atoms";
import { useAtom } from "jotai";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  const [theme] = useAtom(themeAtom);
  return (
    <div
      className="h-screen w-screen"
      data-theme={theme == "fantasy" ? "fantasy" : "night"}
    >
      <Navbar />
      {children}
    </div>
  );
}
