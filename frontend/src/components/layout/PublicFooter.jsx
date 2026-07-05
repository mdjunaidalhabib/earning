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
              <span className="font-display text-base font-semibold">আর্নলেজার</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-paper/60">
              টাস্ক সম্পন্ন করো, বন্ধুদের আমন্ত্রণ জানাও, আর প্রতিটি টাকার হিসাব রাখো তোমার নিজের লেজারে।
            </p>
          </div>

          <div className="flex gap-10 text-sm">
            <div className="flex flex-col gap-2.5">
              <span className="eyebrow text-paper/40">প্ল্যাটফর্ম</span>
              <Link to="/how-it-works" className="text-paper/75 hover:text-brass">
                কিভাবে কাজ করে
              </Link>
              <Link to="/register" className="text-paper/75 hover:text-brass">
                শুরু করুন
              </Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="eyebrow text-paper/40">অ্যাকাউন্ট</span>
              <Link to="/login" className="text-paper/75 hover:text-brass">
                লগ ইন
              </Link>
              <Link to="/dashboard" className="text-paper/75 hover:text-brass">
                ড্যাশবোর্ড
              </Link>
            </div>
          </div>
        </div>

        <div className="ledger-stripe my-8 opacity-30" />

        <p className="text-xs text-paper/40">
          &copy; {new Date().getFullYear()} আর্নলেজার। সর্বস্বত্ব সংরক্ষিত।
        </p>
      </div>
    </footer>
  );
}
