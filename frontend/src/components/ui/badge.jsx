import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        pending: "bg-brass/15 text-brass-dark",
        success: "bg-moss/15 text-moss",
        rejected: "bg-rust/15 text-rust",
        info: "bg-primary/10 text-primary",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

/** Maps common backend status strings to the right visual variant automatically. */
export function StatusBadge({ status, className }) {
  const map = {
    pending: "pending",
    processing: "pending",
    approved: "success",
    completed: "success",
    active: "success",
    credited: "success",
    rejected: "rejected",
    revoked: "rejected",
    paused: "default",
    expired: "default",
  };
  const labelMap = {
    pending: "অপেক্ষমাণ",
    processing: "প্রক্রিয়াধীন",
    approved: "অনুমোদিত",
    completed: "সম্পন্ন",
    active: "সক্রিয়",
    credited: "জমা হয়েছে",
    rejected: "প্রত্যাখ্যাত",
    revoked: "বাতিল",
    paused: "স্থগিত",
    expired: "মেয়াদোত্তীর্ণ",
  };

  return (
    <Badge variant={map[status] || "default"} className={cn(className)}>
      {labelMap[status] || status}
    </Badge>
  );
}
