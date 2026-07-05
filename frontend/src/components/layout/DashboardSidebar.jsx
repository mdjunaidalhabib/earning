import { NavLink } from "react-router-dom";
import { X, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @param {Array<{to: string, label: string, icon: React.ComponentType, end?: boolean}>} navItems
 * @param {boolean} isOpen - mobile drawer open state
 * @param {() => void} onClose
 * @param {string} brandLabel - e.g. "আর্নলেজার" or "আর্নলেজার অ্যাডমিন"
 */
export function DashboardSidebar({ navItems, isOpen, onClose, brandLabel = "আর্নলেজার" }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-ink text-paper transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brass">
              <Wallet className="h-5 w-5 text-ink" strokeWidth={2.25} />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">
              {brandLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-paper/70 hover:bg-paper/10 lg:hidden"
            aria-label="মেনু বন্ধ করুন"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="ledger-stripe mx-6" />

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brass text-ink"
                        : "text-paper/75 hover:bg-paper/10 hover:text-paper"
                    )
                  }
                >
                  <item.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-6 py-5">
          <div className="ledger-stripe mb-4" />
          <p className="text-xs text-paper/40">
            &copy; {new Date().getFullYear()} {brandLabel}। সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </aside>
    </>
  );
}
