import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Loader2, Send, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

import { taskService } from "@/api/taskService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

const categoryLabels = {
  survey: "সার্ভে",
  ad_view: "বিজ্ঞাপন দেখুন",
  app_install: "অ্যাপ ইনস্টল",
  social_follow: "সোশ্যাল ফলো",
  offer: "অফার",
  custom: "কাস্টম",
};

const proofPlaceholders = {
  screenshot: "স্ক্রিনশট URL পেস্ট করো (যেমন Imgur বা Cloudinary থেকে)",
  text: "টাস্কটি কিভাবে সম্পন্ন করেছো তা লিখো",
  link: "সম্পন্ন করার প্রমাণ হিসেবে লিংক পেস্ট করো (যেমন তোমার পোস্টের URL)",
};

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [proofValue, setProofValue] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchTask() {
      try {
        const { data } = await taskService.getTaskById(id);
        if (isMounted) setTask(data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "টাস্ক পাওয়া যায়নি");
        navigate("/dashboard/tasks");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchTask();
    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (task.proofRequired && task.proofType !== "none" && !proofValue.trim()) {
      setError("এই টাস্কের জন্য সম্পন্ন করার প্রমাণ আবশ্যক");
      return;
    }
    setError("");

    setIsSubmitting(true);
    try {
      await taskService.submitTask(task._id, {
        proof: {
          type: task.proofType,
          value: proofValue.trim(),
        },
      });
      setJustSubmitted(true);
      toast.success("সাবমিট হয়েছে! অ্যাডমিনের পর্যালোচনার অপেক্ষায়।");
    } catch (err) {
      toast.error(err.response?.data?.message || "টাস্ক সাবমিট করা যায়নি");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!task) return null;

  const isAvailable = task.isAvailableForUser && !justSubmitted;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        to="/dashboard/tasks"
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> টাস্কে ফিরে যান
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge variant="info" className="mb-2">
                {categoryLabels[task.category] || task.category}
              </Badge>
              <CardTitle>{task.title}</CardTitle>
            </div>
            <span className="balance-figure whitespace-nowrap text-xl text-primary">
              {formatCurrency(task.rewardAmount)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{task.description}</p>

          {task.instructions && (
            <div className="rounded-lg bg-secondary p-4">
              <p className="eyebrow mb-1.5">নির্দেশনা</p>
              <p className="text-sm text-foreground">{task.instructions}</p>
            </div>
          )}

          {task.externalLink && (
            <a
              href={task.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              টাস্ক লিংক খুলুন <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          <div className="ledger-stripe" />

          {justSubmitted ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-moss/15">
                <CheckCircle2 className="h-7 w-7 text-moss" />
              </div>
              <div>
                <p className="font-display text-base font-semibold text-foreground">
                  সাবমিশন গৃহীত হয়েছে
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  একজন অ্যাডমিন শীঘ্রই তোমার সাবমিশন পর্যালোচনা করবেন।
                </p>
              </div>
              <Button asChild variant="brass" size="sm" className="mt-1">
                <Link to="/dashboard/tasks">আরো টাস্ক দেখুন</Link>
              </Button>
            </div>
          ) : !isAvailable ? (
            <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
              তুমি ইতিমধ্যে এই টাস্কটি সর্বোচ্চ সংখ্যকবার সম্পন্ন করে ফেলেছো।
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {task.proofRequired && task.proofType !== "none" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="proof">সম্পন্ন করার প্রমাণ</Label>
                  {task.proofType === "text" ? (
                    <Textarea
                      id="proof"
                      value={proofValue}
                      onChange={(e) => setProofValue(e.target.value)}
                      placeholder={proofPlaceholders[task.proofType]}
                    />
                  ) : (
                    <Input
                      id="proof"
                      value={proofValue}
                      onChange={(e) => setProofValue(e.target.value)}
                      placeholder={proofPlaceholders[task.proofType]}
                    />
                  )}
                  {error && <p className="text-xs text-rust">{error}</p>}
                </div>
              )}

              <Button type="submit" variant="brass" size="lg" disabled={isSubmitting} className="mt-2">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSubmitting ? "সাবমিট হচ্ছে…" : "টাস্ক সাবমিট করুন"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
