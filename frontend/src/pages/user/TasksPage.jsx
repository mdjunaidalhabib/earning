import { useEffect, useState } from "react";
import { ListChecks, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

import { taskService } from "@/api/taskService";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const categories = [
  { value: "all", label: "সব ক্যাটাগরি" },
  { value: "survey", label: "সার্ভে" },
  { value: "ad_view", label: "বিজ্ঞাপন দেখুন" },
  { value: "app_install", label: "অ্যাপ ইনস্টল" },
  { value: "social_follow", label: "সোশ্যাল ফলো" },
  { value: "offer", label: "অফার" },
  { value: "custom", label: "কাস্টম" },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function fetchTasks() {
      try {
        const params = { page, limit: 9 };
        if (category !== "all") params.category = category;
        const { data } = await taskService.getTasks(params);
        if (!isMounted) return;
        setTasks(data.data);
        setMeta(data.meta);
      } catch (err) {
        toast.error(err.response?.data?.message || "টাস্ক লোড করা যায়নি");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchTasks();
    return () => {
      isMounted = false;
    };
  }, [category, page]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            আয়ের টাস্ক
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            নিচের টাস্কগুলো সম্পন্ন করলে তোমার ব্যালেন্সে পুরস্কার জমা হবে।
          </p>
        </div>

        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="ক্যাটাগরি অনুযায়ী ফিল্টার করুন" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="এখন কোনো টাস্ক উপলব্ধ নেই"
          description="একটু পরে আবার দেখো — নিয়মিত নতুন টাস্ক যোগ করা হয়।"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" /> আগের
              </Button>
              <span className="text-sm text-muted-foreground">
                পৃষ্ঠা {page} / {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                পরের <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
