import { Wallet, ShieldCheck, Users, TrendingUp, LayoutDashboard, Lock } from "lucide-react";

const userFeatures = [
  { icon: ShieldCheck, text: "Every entry is logged and verified for accuracy" },
  { icon: TrendingUp, text: "Earn from tasks — surveys, offers, app installs" },
  { icon: Users, text: "Invite friends and earn referral bonuses" },
];

const adminFeatures = [
  { icon: LayoutDashboard, text: "Manage tasks, users, and withdrawals in one place" },
  { icon: ShieldCheck, text: "Review submissions and approve rewards with confidence" },
  { icon: Lock, text: "Restricted to authorized admin accounts only" },
];

export function AuthSplitPanel({ variant = "user" }) {
  const isAdmin = variant === "admin";
  const features = isAdmin ? adminFeatures : userFeatures;

  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-paper lg:flex lg:w-[45%]">
      <div
        className="absolute inset-0 bg-ledger-dots bg-ledger-dots opacity-40"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brass">
          <Wallet className="h-5.5 w-5.5 text-ink" strokeWidth={2.25} />
        </div>
        <span className="font-display text-xl font-semibold tracking-tight">
          EarnLedger{isAdmin && <span className="text-brass"> Admin</span>}
        </span>
      </div>

      <div className="relative z-10">
        <p className="font-display text-3xl font-medium leading-tight text-paper/95">
          {isAdmin ? (
            <>
              Platform control,
              <br />
              একদম নিরাপদ হাতে।
            </>
          ) : (
            <>
              তোমার আয় করা প্রতিটি টাকা,
              <br />
              পাসবইয়ের মতোই হিসাব করে রাখা হয়।
            </>
          )}
        </p>
        <div className="ledger-stripe my-6 max-w-xs opacity-40" />
        <ul className="flex flex-col gap-4">
          {features.map((f) => (
            <li key={f.text} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper/10">
                <f.icon className="h-4 w-4 text-brass" strokeWidth={2} />
              </div>
              <span className="text-sm text-paper/75">{f.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-xs text-paper/35">
        &copy; {new Date().getFullYear()} EarnLedger. All rights reserved.
      </p>
    </div>
  );
}
