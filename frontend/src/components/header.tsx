import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  return (
    <header className="p-2 flex gap-2 bg-white text-black justify-between">
      <nav className="flex flex-row">
        <div className="px-2 font-bold flex gap-2">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/check-cookie">Check Cookie</Link>
        </div>
      </nav>
      <ThemeToggle />
    </header>
  );
}
