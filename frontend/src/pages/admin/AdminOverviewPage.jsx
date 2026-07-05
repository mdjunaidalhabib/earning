import { useEffect, useState } from "react";
import {
  Users,
  ListChecks,
  ClipboardCheck,
  Wallet,
  TrendingUp,
  CircleDollarSign,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import toast from "react-hot-toast";

import { adminService } from "@/api/adminService";
import { StatCard } from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="balance-figure text-sm text-primary">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      try {
        const { data } = await adminService.getDashboardStats();
        if (isMounted) setStats(data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load dashboard stats");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const chartData = (stats?.dailyEarningsTrend || []).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    total: d.total,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Admin Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          পুরো প্ল্যাটফর্মের পরিসংখ্যান আর যেসব কাজ এখনো করা বাকি।
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} accent="ink" />
          <StatCard
            icon={Users}
            label="Active Users"
            value={stats.activeUsers}
            accent="moss"
          />
          <StatCard icon={ListChecks} label="Active Tasks" value={stats.activeTasks} accent="brass" hint={`Total ${stats.totalTasks}`} />
          <StatCard
            icon={ClipboardCheck}
            label="Pending Review"
            value={stats.pendingSubmissions}
            accent="rust"
          />
          <StatCard
            icon={Wallet}
            label="Pending Withdrawals"
            value={stats.pendingWithdrawals}
            accent="rust"
          />
          <StatCard
            icon={CircleDollarSign}
            label="Total Paid Out"
            value={formatCurrency(stats.totalPaidOut)}
            accent="moss"
          />
          <StatCard
            icon={TrendingUp}
            label="Pending Payout Amount"
            value={formatCurrency(stats.totalPendingWithdrawalAmount)}
            accent="brass"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Earnings Trend</CardTitle>
          <CardDescription>Approved task earnings for the last 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : chartData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              এই সময়ের জন্য এখনো কোনো আয়ের তথ্য জমা হয়নি।
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A24B" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#C9A24B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 8" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#C9A24B"
                  strokeWidth={2.5}
                  fill="url(#earningsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
