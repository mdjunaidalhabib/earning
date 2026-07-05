import { Wallet, ShieldCheck, Users, TrendingUp } from "lucide-react";

const features = [
  { icon: ShieldCheck, text: "প্রতিটি এন্ট্রি লগ করা হয় এবং নির্ভুলতার জন্য যাচাই করা হয়" },
  { icon: TrendingUp, text: "টাস্ক থেকে আয় করুন — সার্ভে, অফার, অ্যাপ ইনস্টল" },
  { icon: Users, text: "বন্ধুদের আমন্ত্রণ জানান এবং রেফারেল বোনাস আয় করুন" },
];

export function AuthSplitPanel() {
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
        <span className="font-display text-xl font-semibold tracking-tight">আর্নলেজার</span>
      </div>

      <div className="relative z-10">
        <p className="font-display text-3xl font-medium leading-tight text-paper/95">
          অর্জিত প্রতিটি টাকা,
          <br />
          পাসবইয়ের মতো হিসাব রাখা হয়।
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
        &copy; {new Date().getFullYear()} আর্নলেজার। সর্বস্বত্ব সংরক্ষিত।
      </p>
    </div>
  );
}
