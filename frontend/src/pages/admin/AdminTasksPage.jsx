import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ListChecks, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { adminService } from "@/api/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
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
import { formatCurrency } from "@/lib/utils";

const categoryOptions = [
  { value: "survey", label: "সার্ভে" },
  { value: "ad_view", label: "বিজ্ঞাপন দেখুন" },
  { value: "app_install", label: "অ্যাপ ইনস্টল" },
  { value: "social_follow", label: "সোশ্যাল ফলো" },
  { value: "offer", label: "অফার" },
  { value: "custom", label: "কাস্টম" },
];

const proofTypeOptions = [
  { value: "screenshot", label: "স্ক্রিনশট URL" },
  { value: "text", label: "টেক্সট বিবরণ" },
  { value: "link", label: "লিংক" },
  { value: "none", label: "কোনোটিই না" },
];

const statusOptions = [
  { value: "active", label: "সক্রিয়" },
  { value: "paused", label: "স্থগিত" },
  { value: "expired", label: "মেয়াদোত্তীর্ণ" },
];

const emptyForm = {
  title: "",
  description: "",
  category: "survey",
  rewardAmount: "",
  externalLink: "",
  instructions: "",
  proofRequired: true,
  proofType: "screenshot",
  maxCompletions: "",
  perUserLimit: "1",
  status: "active",
};

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadTasks() {
    setIsLoading(true);
    try {
      const { data } = await adminService.getAllTasks({ limit: 50 });
      setTasks(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "টাস্ক লোড করা যায়নি");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function openCreateForm() {
    setEditingTask(null);
    setForm(emptyForm);
    setErrors({});
    setIsFormOpen(true);
  }

  function openEditForm(task) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      category: task.category,
      rewardAmount: String(task.rewardAmount),
      externalLink: task.externalLink || "",
      instructions: task.instructions || "",
      proofRequired: task.proofRequired,
      proofType: task.proofType,
      maxCompletions: task.maxCompletions ? String(task.maxCompletions) : "",
      perUserLimit: String(task.perUserLimit),
      status: task.status,
    });
    setErrors({});
    setIsFormOpen(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "টাইটেল আবশ্যক";
    if (!form.description.trim()) newErrors.description = "বিবরণ আবশ্যক";
    if (!form.rewardAmount || parseFloat(form.rewardAmount) <= 0) {
      newErrors.rewardAmount = "পুরস্কারের পরিমাণ ০ এর চেয়ে বেশি হতে হবে";
    }
    if (form.externalLink && !/^https?:\/\/.+/.test(form.externalLink)) {
      newErrors.externalLink = "http(s):// দিয়ে শুরু হওয়া একটি সঠিক URL হতে হবে";
    }
    if (form.maxCompletions && parseInt(form.maxCompletions, 10) < 1) {
      newErrors.maxCompletions = "কমপক্ষে ১ হতে হবে";
    }
    if (!form.perUserLimit || parseInt(form.perUserLimit, 10) < 1) {
      newErrors.perUserLimit = "কমপক্ষে ১ হতে হবে";
    }
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      rewardAmount: parseFloat(form.rewardAmount),
      externalLink: form.externalLink.trim() || undefined,
      instructions: form.instructions.trim() || undefined,
      proofRequired: form.proofRequired,
      proofType: form.proofType,
      maxCompletions: form.maxCompletions ? parseInt(form.maxCompletions, 10) : null,
      perUserLimit: parseInt(form.perUserLimit, 10),
      status: form.status,
    };

    setIsSaving(true);
    try {
      if (editingTask) {
        await adminService.updateTask(editingTask._id, payload);
        toast.success("টাস্ক সফলভাবে আপডেট হয়েছে");
      } else {
        await adminService.createTask(payload);
        toast.success("টাস্ক সফলভাবে তৈরি হয়েছে");
      }
      setIsFormOpen(false);
      await loadTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "টাস্ক সংরক্ষণ করা যায়নি");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminService.deleteTask(deleteTarget._id);
      toast.success("টাস্ক সফলভাবে মুছে ফেলা হয়েছে");
      setDeleteTarget(null);
      await loadTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "টাস্ক মুছে ফেলা যায়নি");
    } finally {
      setIsDeleting(false);
    }
  }

  const categoryLabels = Object.fromEntries(categoryOptions.map((c) => [c.value, c.label]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            টাস্ক ব্যবস্থাপনা
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ইউজারদের জন্য আয়ের সুযোগ তৈরি ও পরিচালনা করো।
          </p>
        </div>
        <Button variant="brass" onClick={openCreateForm}>
          <Plus className="h-4 w-4" /> নতুন টাস্ক
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="এখনো কোনো টাস্ক তৈরি হয়নি"
          description="ইউজারদের শুরু করানোর জন্য তোমার প্রথম টাস্ক তৈরি করো।"
        />
      ) : (
        <div className="ledger-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">টাস্ক</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">ক্যাটাগরি</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">পুরস্কার</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">সম্পন্ন হয়েছে</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">অবস্থা</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td className="max-w-xs truncate px-4 py-3 font-medium text-foreground">
                      {task.title}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{categoryLabels[task.category]}</Badge>
                    </td>
                    <td className="balance-figure px-4 py-3 text-primary">
                      {formatCurrency(task.rewardAmount)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {task.completedCount}
                      {task.maxCompletions ? ` / ${task.maxCompletions}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="icon" onClick={() => openEditForm(task)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-rust hover:bg-rust/10 hover:text-rust"
                          onClick={() => setDeleteTarget(task)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTask ? "টাস্ক সম্পাদনা করুন" : "নতুন টাস্ক তৈরি করুন"}</DialogTitle>
            <DialogDescription>
              এই আয়ের সুযোগের বিস্তারিত তথ্য পূরণ করো।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">টাইটেল</Label>
              <Input id="title" name="title" value={form.title} onChange={handleChange} />
              {errors.title && <p className="text-xs text-rust">{errors.title}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">বিবরণ</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
              {errors.description && <p className="text-xs text-rust">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>ক্যাটাগরি</Label>
                <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rewardAmount">পুরস্কারের পরিমাণ</Label>
                <Input
                  id="rewardAmount"
                  name="rewardAmount"
                  type="number"
                  step="0.01"
                  value={form.rewardAmount}
                  onChange={handleChange}
                />
                {errors.rewardAmount && <p className="text-xs text-rust">{errors.rewardAmount}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="externalLink">
                এক্সটার্নাল লিংক <span className="text-muted-foreground">(ঐচ্ছিক)</span>
              </Label>
              <Input
                id="externalLink"
                name="externalLink"
                placeholder="https://..."
                value={form.externalLink}
                onChange={handleChange}
              />
              {errors.externalLink && <p className="text-xs text-rust">{errors.externalLink}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="instructions">
                নির্দেশনা <span className="text-muted-foreground">(ঐচ্ছিক)</span>
              </Label>
              <Textarea
                id="instructions"
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>প্রমাণের ধরন</Label>
                <Select value={form.proofType} onValueChange={(v) => setForm((p) => ({ ...p, proofType: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {proofTypeOptions.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>অবস্থা</Label>
                <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maxCompletions">
                  সর্বোচ্চ সম্পন্ন সংখ্যা <span className="text-muted-foreground">(ফাঁকা = সীমাহীন)</span>
                </Label>
                <Input
                  id="maxCompletions"
                  name="maxCompletions"
                  type="number"
                  value={form.maxCompletions}
                  onChange={handleChange}
                />
                {errors.maxCompletions && (
                  <p className="text-xs text-rust">{errors.maxCompletions}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="perUserLimit">প্রতি ইউজার সীমা</Label>
                <Input
                  id="perUserLimit"
                  name="perUserLimit"
                  type="number"
                  value={form.perUserLimit}
                  onChange={handleChange}
                />
                {errors.perUserLimit && <p className="text-xs text-rust">{errors.perUserLimit}</p>}
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.proofRequired}
                onChange={(e) => setForm((p) => ({ ...p, proofRequired: e.target.checked }))}
                className="h-4 w-4 rounded border-input text-brass accent-brass"
              />
              সম্পন্ন করার প্রমাণ আবশ্যক
            </label>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  বাতিল
                </Button>
              </DialogClose>
              <Button type="submit" variant="brass" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingTask ? "পরিবর্তন সংরক্ষণ করুন" : "টাস্ক তৈরি করুন"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="এই টাস্কটি মুছে ফেলবেন?"
        description={`"${deleteTarget?.title}" স্থায়ীভাবে মুছে ফেলা হবে। এটি পূর্বাবস্থায় ফেরানো যাবে না।`}
        confirmLabel="টাস্ক মুছে ফেলুন"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
