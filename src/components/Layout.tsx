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
      <div className="z-50 flex h-fit">
        <Navbar />
      </div>
      <div className="z-0 h-full">{children}</div>
    </div>
  );
}
