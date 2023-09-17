// components/ThemeSwitcher.tsx
import { Switch } from "@nextui-org/react";
import { set } from "date-fns";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    if (theme === "dark") {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, [theme]);

  function handleThemeChange() {
    if (isDark) {
      setTheme("light");
      setIsDark(false);
    } else {
      setTheme("dark");
      setIsDark(true);
    }
  }

  return (
    <Switch
      defaultSelected={isDark}
      size="lg"
      color="secondary"
      thumbIcon={({ isSelected }) =>
        isSelected ? <MoonIcon className="text-neutral-900" /> : <SunIcon />
      }
      onClick={handleThemeChange}
    />
    // <div>
    //   <button onClick={() => setTheme("light")}>Light Mode</button>
    //   <button onClick={() => setTheme("dark")}>Dark Mode</button>
    // </div>
  );
};
