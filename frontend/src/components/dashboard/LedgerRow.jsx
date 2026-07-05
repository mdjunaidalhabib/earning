import { ArrowDownLeft, ArrowUpRight, ListChecks, Users, Wallet } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const typeMeta = {
  task_earning: { icon: ListChecks, label: "Task Earnings", isCredit: true },
  referral_bonus: { icon: Users, label: "Referral Bonus", isCredit: true },
  withdrawal: { icon: Wallet, label: "Withdrawal", isCredit: false },
  admin_credit: { icon: ArrowDownLeft, label: "Admin Credit", isCredit: true },
  admin_debit: { icon: ArrowUpRight, label: "Admin Debit", isCredit: false },
};

export function LedgerRow({ transaction }) {
  const meta = typeMeta[transaction.type] || typeMeta.task_earning;
  const Icon = meta.icon;

  return (
    <div className="flex items-center gap-4 py-4">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          meta.isCredit ? "bg-moss/15 text-moss" : "bg-rust/15 text-rust"
        )}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {transaction.description || meta.label}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDate(transaction.createdAt)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span
          className={cn(
            "balance-figure text-sm",
            meta.isCredit ? "text-moss" : "text-rust"
          )}
        >
          {meta.isCredit ? "+" : "−"} {formatCurrency(transaction.amount)}
        </span>
        <StatusBadge status={transaction.status} />
      </div>
    </div>
  );
}
