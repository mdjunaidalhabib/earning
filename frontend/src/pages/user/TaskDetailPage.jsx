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
  survey: "Survey",
  ad_view: "Watch Ads",
  app_install: "App Install",
  social_follow: "Social Follow",
  offer: "Offer",
  custom: "Custom",
};

const proofPlaceholders = {
  screenshot: "Paste a screenshot URL (e.g. from Imgur or Cloudinary)",
  text: "Describe how you completed this task",
  link: "Paste a link as proof of completion (e.g. your post's URL)",
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
        toast.error(err.response?.data?.message || "Task not found");
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
      setError("Proof of completion is required for this task");
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
      toast.success("Submitted! Waiting for admin review.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit task");
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
        <ArrowLeft className="h-4 w-4" /> Back to Tasks
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
              <p className="eyebrow mb-1.5">Instructions</p>
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
              Open Task Link <ExternalLink className="h-3.5 w-3.5" />
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
                  Submission Accepted
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  একজন অ্যাডমিন খুব শীঘ্রই তোমার জমা দেওয়া কাজটা যাচাই করবেন।
                </p>
              </div>
              <Button asChild variant="brass" size="sm" className="mt-1">
                <Link to="/dashboard/tasks">View More Tasks</Link>
              </Button>
            </div>
          ) : !isAvailable ? (
            <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
              তুমি ইতিমধ্যে এই কাজটা যতবার করা যায় ততবারই করে ফেলেছো।
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {task.proofRequired && task.proofType !== "none" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="proof">Proof of Completion</Label>
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
                {isSubmitting ? "Submitting…" : "Submit Task"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
