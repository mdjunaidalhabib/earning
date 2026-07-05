import { useEffect, useState } from "react";
import { ClipboardCheck, Check, X, Loader2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

import { adminService } from "@/api/adminService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  async function loadSubmissions() {
    setIsLoading(true);
    try {
      const { data } = await adminService.getPendingSubmissions({ limit: 50 });
      setSubmissions(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "সাবমিশন লোড করা যায়নি");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function handleApprove(id) {
    setProcessingId(id);
    try {
      await adminService.reviewSubmission(id, { decision: "approve" });
      toast.success("সাবমিশন অনুমোদিত এবং পুরস্কার জমা হয়েছে");
      setSubmissions((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "সাবমিশন অনুমোদন করা যায়নি");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      toast.error("প্রত্যাখ্যানের কারণ উল্লেখ করুন");
      return;
    }
    setProcessingId(rejectTarget._id);
    try {
      await adminService.reviewSubmission(rejectTarget._id, {
        decision: "reject",
        rejectionReason: rejectionReason.trim(),
      });
      toast.success("সাবমিশন প্রত্যাখ্যাত হয়েছে");
      setSubmissions((prev) => prev.filter((s) => s._id !== rejectTarget._id));
      setRejectTarget(null);
      setRejectionReason("");
    } catch (err) {
      toast.error(err.response?.data?.message || "সাবমিশন প্রত্যাখ্যান করা যায়নি");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          সাবমিশন পর্যালোচনা
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          অপেক্ষমাণ টাস্ক সম্পন্নগুলো অনুমোদন বা প্রত্যাখ্যান করো। অনুমোদন করলে সাথে সাথেই পুরস্কার জমা হয়ে যায়।
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="সব দেখা হয়ে গেছে"
          description="এখন পর্যালোচনার জন্য কোনো অপেক্ষমাণ সাবমিশন নেই।"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {submissions.map((sub) => (
            <div key={sub._id} className="ledger-card p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {sub.user?.name} <span className="text-muted-foreground">({sub.user?.email})</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {sub.relatedTask?.title || sub.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    সাবমিট করা হয়েছে {formatDate(sub.createdAt)}
                  </p>
                </div>
                <span className="balance-figure whitespace-nowrap text-lg text-primary">
                  {formatCurrency(sub.amount)}
                </span>
              </div>

              {sub.proof?.value && (
                <div className="mt-3 rounded-lg bg-secondary p-3">
                  <p className="eyebrow mb-1">প্রমাণ ({sub.proof.type})</p>
                  {sub.proof.type === "link" || sub.proof.type === "screenshot" ? (
                    <a
                      href={sub.proof.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 break-all text-sm font-medium text-primary hover:underline"
                    >
                      {sub.proof.value} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  ) : (
                    <p className="text-sm text-foreground">{sub.proof.value}</p>
                  )}
                </div>
              )}

              <div className="ledger-stripe my-4" />

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rust hover:bg-rust/10 hover:text-rust"
                  onClick={() => setRejectTarget(sub)}
                  disabled={processingId === sub._id}
                >
                  <X className="h-4 w-4" /> প্রত্যাখ্যান
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleApprove(sub._id)}
                  disabled={processingId === sub._id}
                >
                  {processingId === sub._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  অনুমোদন
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>সাবমিশন প্রত্যাখ্যান করুন</DialogTitle>
            <DialogDescription>
              একটি কারণ উল্লেখ করো যাতে ইউজার বুঝতে পারে কেন এটি প্রত্যাখ্যাত হয়েছে।
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rejectionReason">প্রত্যাখ্যানের কারণ</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="যেমন: স্ক্রিনশট টাস্কের প্রয়োজনীয়তার সাথে মিলছে না"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                বাতিল
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={processingId === rejectTarget?._id}
            >
              {processingId === rejectTarget?._id && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              সাবমিশন প্রত্যাখ্যান করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
