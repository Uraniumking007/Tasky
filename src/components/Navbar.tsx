/* eslint-disable @next/next/no-img-element */
import { themeAtom } from "@/utils/atoms";
import { useAtom } from "jotai";
import { signOut, useSession } from "next-auth/react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

const Navbar = () => {
  const [theme, setTheme] = useAtom(themeAtom);
  const { data: session } = useSession();

  function handleThemeChange() {
    setTheme(theme === "fantasy" ? "night" : "fantasy");
  }

  function handleLogout() {
    void signOut({
      callbackUrl: "/",
    });
  }

  return (
    <div className="navbar z-10 bg-base-100 drop-shadow-2xl">
      <div className="navbar-start">
        <div className="drawer lg:hidden">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            {/* Page content here */}
            <label
              htmlFor="my-drawer"
              className="btn btn-primary drawer-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </label>
          </div>
          <div className="drawer-side">
            <label htmlFor="my-drawer" className="drawer-overlay" />
            <div className="menu h-full w-80 justify-between bg-base-200 p-4 text-base-content">
              <ul className="">
                {/* Sidebar content here */}
                <li>
                  <a>Sidebar Item 1</a>
                </li>
                <li>
                  <a>Sidebar Item 2</a>
                </li>
                <li className="drawer-toggle">Close</li>
              </ul>
              <div className="flex justify-end">
                <input
                  id="my-drawer"
                  type="checkbox"
                  className="drawer-toggle"
                />
                {/* Page content here */}
                <label
                  htmlFor="my-drawer"
                  className="btn btn-primary drawer-button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg> */}
        {/* </label> */}
        {/* <ul
            tabIndex={0}
            className="menu dropdown-content rounded-box menu-sm z-[1] mt-3 w-52 bg-base-100 p-2 shadow"
          >
            <li>
              <a>Item 1</a>
            </li>
            <li>
              <a>Parent</a>
              <ul className="p-2">
                <li>
                  <a>Submenu 1</a>
                </li>
                <li>
                  <a>Submenu 2</a>
                </li>
              </ul>
            </li>
            <li>
              <a>Item 3</a>
            </li>
          </ul>
        </div*/}
        <a className="btn btn-ghost text-xl normal-case">Tasky</a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <a>Item 1</a>
          </li>
          <li tabIndex={0}>
            <details>
              <summary>Parent</summary>
              <ul className="p-2">
                <li>
                  <a>Submenu 1</a>
                </li>
                <li>
                  <a>Submenu 2</a>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <a>Item 3</a>
          </li>
        </ul>
      </div>
      <div className="navbar-end z-10">
        {/* <a className="btn">Button</a> */}
        {session?.user ? (
          <div className="dropdown-end dropdown">
            <label tabIndex={0} className="avatar btn btn-circle btn-ghost">
              <div className="w-10 rounded-full">
                <img
                  src="/images/stock/photo-1534528741775-53994a69daeb.jpg"
                  alt="testing"
                />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu dropdown-content rounded-box menu-sm z-[10] mt-3 w-52 bg-base-100 p-2 shadow"
            >
              <li>
                <a className="justify-between">
                  Profile
                  <span className="badge">New</span>
                </a>
              </li>
              <li>
                <a>Settings</a>
              </li>
              <li onClick={handleLogout}>
                <a>Logout</a>
              </li>
              <li>
                <a>
                  <span>Theme </span>
                  <label className="swap swap-rotate ">
                    {/* this hidden checkbox controls the state */}
                    <input type="checkbox" onClick={handleThemeChange} />

                    {theme === "fantasy" ? <Sun /> : <Moon />}
                  </label>
                </a>
              </li>
            </ul>
          </div>
        ) : (
          <Link href={"/login"} className="pr-8">
            <Button variant={"base-300"}>Login</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
