import { cn } from "@/lib/utils";

export function StatCard({ icon: Icon, label, value, accent = "brass", hint, className }) {
  const accentClasses = {
    brass: "bg-brass/15 text-brass-dark",
    moss: "bg-moss/15 text-moss",
    rust: "bg-rust/15 text-rust",
    ink: "bg-ink/10 text-ink",
  };

  return (
    <div className={cn("ledger-card p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow">{label}</p>
          <p className="balance-figure mt-2 text-2xl text-foreground">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", accentClasses[accent])}>
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
}
