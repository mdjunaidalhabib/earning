import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const categoryLabels = {
  survey: "সার্ভে",
  ad_view: "বিজ্ঞাপন দেখুন",
  app_install: "অ্যাপ ইনস্টল",
  social_follow: "সোশ্যাল ফলো",
  offer: "অফার",
  custom: "কাস্টম",
};

export function TaskCard({ task }) {
  const isAvailable = task.isAvailableForUser;

  return (
    <div className="ledger-card flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <Badge variant="info">{categoryLabels[task.category] || task.category}</Badge>
        {!isAvailable && (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> সম্পন্ন হয়েছে
          </Badge>
        )}
      </div>

      <h3 className="mt-3 font-display text-base font-semibold text-foreground line-clamp-2">
        {task.title}
      </h3>
      <p className="mt-1.5 flex-1 text-sm text-muted-foreground line-clamp-2">
        {task.description}
      </p>

      <div className="ledger-stripe my-4" />

      <div className="flex items-center justify-between">
        <span className="balance-figure text-lg text-primary">
          {formatCurrency(task.rewardAmount)}
        </span>
        <Button asChild variant={isAvailable ? "brass" : "outline"} size="sm" disabled={!isAvailable}>
          <Link to={`/dashboard/tasks/${task._id}`}>
            {isAvailable ? "টাস্ক শুরু করুন" : "দেখুন"} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
