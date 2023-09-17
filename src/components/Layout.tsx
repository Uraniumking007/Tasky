import CustomNavbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="h-screen w-screen">
      <div className="z-50 flex h-fit w-full">
        <CustomNavbar />
      </div>
      <div className="z-0 h-full">{children}</div>
    </div>
  );
}
