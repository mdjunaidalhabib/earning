import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const links = [
  { to: "/", label: "হোম" },
  { to: "/how-it-works", label: "কিভাবে কাজ করে" },
];

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink">
            <Wallet className="h-5 w-5 text-brass" strokeWidth={2.25} />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            আর্নলেজার
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Button asChild variant="brass">
              <Link to={isAdmin ? "/admin" : "/dashboard"}>ড্যাশবোর্ডে যান</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">লগ ইন</Link>
              </Button>
              <Button asChild variant="brass">
                <Link to="/register">শুরু করুন</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-md p-2 text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="মেনু টগল করুন"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="container flex flex-col gap-4 py-5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-foreground"
              >
                {link.label}
              </NavLink>
            ))}
            <div className="ledger-stripe" />
            {isAuthenticated ? (
              <Button asChild variant="brass" onClick={() => setOpen(false)}>
                <Link to={isAdmin ? "/admin" : "/dashboard"}>ড্যাশবোর্ডে যান</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" onClick={() => setOpen(false)}>
                  <Link to="/login">লগ ইন</Link>
                </Button>
                <Button asChild variant="brass" onClick={() => setOpen(false)}>
                  <Link to="/register">শুরু করুন</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
