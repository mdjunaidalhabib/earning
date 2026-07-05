import { useEffect, useState } from "react";
import { Wallet, Loader2, Plus, X, Landmark } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import { withdrawalService } from "@/api/withdrawalService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

const methods = [
  { value: "bkash", label: "বিকাশ" },
  { value: "nagad", label: "নগদ" },
  { value: "rocket", label: "রকেট" },
  { value: "bank_transfer", label: "ব্যাংক ট্রান্সফার" },
];

const MIN_WITHDRAWAL = 100;

export default function WithdrawalsPage() {
  const { user, refreshUser } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const [form, setForm] = useState({
    amount: "",
    method: "bkash",
    accountName: "",
    accountNumber: "",
    bankName: "",
  });
  const [errors, setErrors] = useState({});

  async function loadWithdrawals() {
    setIsLoading(true);
    try {
      const { data } = await withdrawalService.getMine({ limit: 20 });
      setWithdrawals(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "উত্তোলন লোড করা যায়নি");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadWithdrawals();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const newErrors = {};
    const amountNum = parseFloat(form.amount);

    if (!form.amount || Number.isNaN(amountNum)) {
      newErrors.amount = "একটি সঠিক পরিমাণ লিখুন";
    } else if (amountNum < MIN_WITHDRAWAL) {
      newErrors.amount = `সর্বনিম্ন উত্তোলন ${formatCurrency(MIN_WITHDRAWAL)}`;
    } else if (amountNum > (user?.balance || 0)) {
      newErrors.amount = "পরিমাণটি তোমার ব্যালেন্স থেকে বেশি";
    }

    if (!form.accountName.trim()) newErrors.accountName = "অ্যাকাউন্ট হোল্ডারের নাম আবশ্যক";
    if (!form.accountNumber.trim()) newErrors.accountNumber = "অ্যাকাউন্ট নম্বর আবশ্যক";
    if (form.method === "bank_transfer" && !form.bankName.trim()) {
      newErrors.bankName = "ব্যাংক ট্রান্সফারের জন্য ব্যাংকের নাম আবশ্যক";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await withdrawalService.create({
        amount: parseFloat(form.amount),
        method: form.method,
        accountDetails: {
          accountName: form.accountName.trim(),
          accountNumber: form.accountNumber.trim(),
          bankName: form.bankName.trim(),
        },
      });
      toast.success("উত্তোলনের অনুরোধ জমা হয়েছে");
      setIsDialogOpen(false);
      setForm({ amount: "", method: "bkash", accountName: "", accountNumber: "", bankName: "" });
      await Promise.all([loadWithdrawals(), refreshUser()]);
    } catch (err) {
      toast.error(err.response?.data?.message || "উত্তোলনের অনুরোধ জমা দেওয়া যায়নি");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel(id) {
    setCancellingId(id);
    try {
      await withdrawalService.cancel(id);
      toast.success("উত্তোলন বাতিল করা হয়েছে এবং ব্যালেন্স ফেরত দেওয়া হয়েছে");
      await Promise.all([loadWithdrawals(), refreshUser()]);
    } catch (err) {
      toast.error(err.response?.data?.message || "উত্তোলন বাতিল করা যায়নি");
    } finally {
      setCancellingId(null);
    }
  }

  const methodLabels = Object.fromEntries(methods.map((m) => [m.value, m.label]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            উত্তোলন
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            উপলব্ধ ব্যালেন্স:{" "}
            <span className="balance-figure text-primary">{formatCurrency(user?.balance)}</span>
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="brass">
              <Plus className="h-4 w-4" /> উত্তোলনের অনুরোধ করুন
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>উত্তোলনের অনুরোধ করুন</DialogTitle>
              <DialogDescription>
                সর্বনিম্ন উত্তোলনযোগ্য পরিমাণ {formatCurrency(MIN_WITHDRAWAL)}।
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="amount">পরিমাণ</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="যেমন ৫০০"
                  value={form.amount}
                  onChange={handleChange}
                />
                {errors.amount && <p className="text-xs text-rust">{errors.amount}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="method">উত্তোলন পদ্ধতি</Label>
                <Select value={form.method} onValueChange={(v) => setForm((p) => ({ ...p, method: v }))}>
                  <SelectTrigger id="method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {methods.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="accountName">অ্যাকাউন্ট হোল্ডারের নাম</Label>
                <Input
                  id="accountName"
                  name="accountName"
                  placeholder="অ্যাকাউন্টে থাকা পুরো নাম"
                  value={form.accountName}
                  onChange={handleChange}
                />
                {errors.accountName && <p className="text-xs text-rust">{errors.accountName}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="accountNumber">
                  {form.method === "bank_transfer" ? "অ্যাকাউন্ট নম্বর" : "মোবাইল নম্বর"}
                </Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  placeholder={form.method === "bank_transfer" ? "যেমন 0123456789" : "যেমন 01712345678"}
                  value={form.accountNumber}
                  onChange={handleChange}
                />
                {errors.accountNumber && (
                  <p className="text-xs text-rust">{errors.accountNumber}</p>
                )}
              </div>

              {form.method === "bank_transfer" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="bankName">ব্যাংকের নাম</Label>
                  <Input
                    id="bankName"
                    name="bankName"
                    placeholder="যেমন ডাচ-বাংলা ব্যাংক"
                    value={form.bankName}
                    onChange={handleChange}
                  />
                  {errors.bankName && <p className="text-xs text-rust">{errors.bankName}</p>}
                </div>
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    বাতিল
                  </Button>
                </DialogClose>
                <Button type="submit" variant="brass" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  অনুরোধ জমা দিন
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : withdrawals.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="এখনো কোনো উত্তোলনের অনুরোধ নেই"
          description="পর্যাপ্ত আয় হয়ে গেলে এখান থেকে তোমার প্রথম উত্তোলনের অনুরোধ করো।"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {withdrawals.map((w) => (
            <div key={w._id} className="ledger-card flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                <Landmark className="h-[18px] w-[18px] text-slateink" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {methodLabels[w.method]} &middot; {w.accountDetails.accountNumber}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  অনুরোধ করা হয়েছে {formatDate(w.createdAt)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="balance-figure text-sm text-foreground">
                  {formatCurrency(w.amount)}
                </span>
                <StatusBadge status={w.status} />
              </div>
              {w.status === "pending" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCancel(w._id)}
                  disabled={cancellingId === w._id}
                  aria-label="উত্তোলন বাতিল করুন"
                  className="text-rust hover:bg-rust/10 hover:text-rust"
                >
                  {cancellingId === w._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
