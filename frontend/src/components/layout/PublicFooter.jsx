import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-ink text-paper">
      <div className="container py-12">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass">
                <Wallet className="h-4.5 w-4.5 text-ink" strokeWidth={2.25} />
              </div>
              <span className="font-display text-base font-semibold">EarnLedger</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-paper/60">
              Task Complete করো, বন্ধুদের আমন্ত্রণ জানাও, আর প্রতিটি Taka-র হিসাব রাখো তোমার নিজের Ledger-এ।
            </p>
          </div>

          <div className="flex gap-10 text-sm">
            <div className="flex flex-col gap-2.5">
              <span className="eyebrow text-paper/40">Platform</span>
              <Link to="/how-it-works" className="text-paper/75 hover:text-brass">
                How It Works
              </Link>
              <Link to="/register" className="text-paper/75 hover:text-brass">
                Get Started
              </Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="eyebrow text-paper/40">Account</span>
              <Link to="/login" className="text-paper/75 hover:text-brass">
                Log In
              </Link>
              <Link to="/dashboard" className="text-paper/75 hover:text-brass">
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="ledger-stripe my-8 opacity-30" />

        <p className="text-xs text-paper/40">
          &copy; {new Date().getFullYear()} EarnLedger. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
