import { createFileRoute } from "@tanstack/react-router";
import logo from "../logo.svg";

export const Route = createFileRoute("/about")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="text-center">
      <header className="flex min-h-screen flex-col items-center justify-center bg-[#282c34] text-[calc(10px+2vmin)] text-white">
        <img
          src={logo}
          className="pointer-events-none h-[40vmin] animate-[spin_20s_linear_infinite]"
          alt="logo"
        />
        <p>About Page</p>
      </header>
    </div>
  );
}
