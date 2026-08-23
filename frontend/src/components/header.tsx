import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./theme-toggle";
import { LogoutButton } from "./logout-button";

export function Header() {
  return (
    <header className="flex justify-between gap-2 bg-white p-2 text-black">
      <nav className="flex flex-row">
        <div className="flex gap-2 px-2 font-bold">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/check-cookie">Check Cookie</Link>
          <Link to="/books">Books</Link>
          <LogoutButton />
        </div>
      </nav>
      <ThemeToggle />
    </header>
  );
}
