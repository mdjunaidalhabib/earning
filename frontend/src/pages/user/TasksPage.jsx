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
  { value: "all", label: "All Categories" },
  { value: "survey", label: "Survey" },
  { value: "ad_view", label: "Watch Ads" },
  { value: "app_install", label: "App Install" },
  { value: "social_follow", label: "Social Follow" },
  { value: "offer", label: "Offer" },
  { value: "custom", label: "Custom" },
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
        toast.error(err.response?.data?.message || "Failed to load tasks");
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
            Earning Tasks
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            নিচের কাজগুলো শেষ করলেই তোমার ব্যালেন্সে পুরস্কারের টাকা জমা হয়ে যাবে।
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
            <SelectValue placeholder="Filter by category" />
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
          title="No tasks available right now"
          description="Check back soon — new tasks are added regularly."
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
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} / {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
