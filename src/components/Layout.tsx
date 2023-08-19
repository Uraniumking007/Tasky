import { themeAtom } from "@/utils/atoms";
import { useAtom } from "jotai";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  const [theme, setTheme] = useAtom(themeAtom);
  return (
    <div data-theme={theme == "fantasy" ? "fantasy" : "night"}>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}