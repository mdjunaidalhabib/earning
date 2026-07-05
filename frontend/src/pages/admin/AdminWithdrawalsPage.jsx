import { useEffect, useState } from "react";
import { Wallet, Loader2, Check, X, Clock } from "lucide-react";
import toast from "react-hot-toast";

import { adminService } from "@/api/adminService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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

const filterOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

const methodLabelsBn = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank_transfer: "Bank Transfer",
};

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [processingId, setProcessingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  async function loadWithdrawals() {
    setIsLoading(true);
    try {
      const params = { limit: 50 };
      if (filter !== "all") params.status = filter;
      const { data } = await adminService.getAllWithdrawals(params);
      setWithdrawals(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load withdrawals");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadWithdrawals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function updateStatus(id, status, extra = {}) {
    setProcessingId(id);
    try {
      await adminService.updateWithdrawalStatus(id, { status, ...extra });
      toast.success(`Withdrawal marked as "${status}"`);
      await loadWithdrawals();
      setRejectTarget(null);
      setRejectionReason("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update withdrawal");
    } finally {
      setProcessingId(null);
    }
  }

  function handleRejectSubmit() {
    if (!rejectionReason.trim()) {
      toast.error("Specify a reason for rejection");
      return;
    }
    updateStatus(rejectTarget._id, "rejected", { rejectionReason: rejectionReason.trim() });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Withdrawal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ইউজারদের টাকা তোলার আবেদনগুলো যাচাই করো আর প্রসেস করো।
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : withdrawals.length === 0 ? (
        <EmptyState icon={Wallet} title="No withdrawals found" description="Nothing matches this filter right now." />
      ) : (
        <div className="flex flex-col gap-3">
          {withdrawals.map((w) => (
            <div key={w._id} className="ledger-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {w.user?.name} <span className="text-muted-foreground">({w.user?.email})</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {methodLabelsBn[w.method] || w.method.replace("_", " ")} &middot; {w.accountDetails.accountName} &middot;{" "}
                  {w.accountDetails.accountNumber}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Requested on {formatDate(w.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="balance-figure text-base text-foreground">
                  {formatCurrency(w.amount)}
                </span>
                <StatusBadge status={w.status} />
              </div>

              {["pending", "processing"].includes(w.status) && (
                <div className="flex gap-2">
                  {w.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(w._id, "processing")}
                      disabled={processingId === w._id}
                    >
                      <Clock className="h-4 w-4" /> Process
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-rust hover:bg-rust/10 hover:text-rust"
                    onClick={() => setRejectTarget(w)}
                    disabled={processingId === w._id}
                  >
                    <X className="h-4 w-4" /> Reject
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => updateStatus(w._id, "completed")}
                    disabled={processingId === w._id}
                  >
                    {processingId === w._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Mark as Paid
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
            <DialogDescription>
              আটকে রাখা ব্যালেন্স স্বয়ংক্রিয়ভাবে ইউজারের অ্যাকাউন্টে ফেরত চলে যাবে।
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="withdrawalRejectionReason">Rejection Reason</Label>
            <Textarea
              id="withdrawalRejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Could not verify account information"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={processingId === rejectTarget?._id}
            >
              {processingId === rejectTarget?._id && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Reject & Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
