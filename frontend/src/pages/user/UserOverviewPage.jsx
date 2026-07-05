import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, TrendingUp, Clock, Users, ArrowRight, Receipt } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import { userService } from "@/api/userService";
import { StatCard } from "@/components/dashboard/StatCard";
import { LedgerRow } from "@/components/dashboard/LedgerRow";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function UserOverviewPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const [summaryRes, txRes] = await Promise.all([
          userService.getDashboardSummary(),
          userService.getTransactions({ limit: 6 }),
        ]);
        if (!isMounted) return;
        setSummary(summaryRes.data.data);
        setTransactions(txRes.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "ড্যাশবোর্ড লোড করা যায়নি");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          আবার স্বাগতম, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          আজকের তোমার লেজারের একটি সংক্ষিপ্ত চিত্র এখানে।
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Wallet}
            label="বর্তমান ব্যালেন্স"
            value={formatCurrency(summary?.balance)}
            accent="brass"
            hint="উত্তোলনের জন্য উপলব্ধ"
          />
          <StatCard
            icon={TrendingUp}
            label="এই মাসের আয়"
            value={formatCurrency(summary?.earnedThisMonth)}
            accent="moss"
          />
          <StatCard
            icon={Clock}
            label="পর্যালোচনাধীন"
            value={formatCurrency(summary?.pendingEarnings)}
            accent="ink"
            hint="অ্যাডমিনের অনুমোদনের অপেক্ষায়"
          />
          <StatCard
            icon={Users}
            label="রেফারেল"
            value={summary?.referralCount ?? 0}
            accent="rust"
            hint={`কোড: ${summary?.referralCode || "—"}`}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>সাম্প্রতিক লেজার এন্ট্রি</CardTitle>
            <Link to="/dashboard/withdrawals" className="text-sm font-medium text-primary hover:underline">
              সব দেখুন
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="এখনো কোনো লেনদেন নেই"
                description="তোমার লেজারে এন্ট্রি দেখতে প্রথম টাস্কটি সম্পন্ন করো।"
                action={
                  <Button asChild variant="brass" size="sm" className="mt-2">
                    <Link to="/dashboard/tasks">
                      টাস্ক দেখুন <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-border">
                {transactions.map((tx) => (
                  <LedgerRow key={tx._id} transaction={tx} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>দ্রুত কার্যক্রম</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild variant="brass" className="justify-between">
              <Link to="/dashboard/tasks">
                আয়ের টাস্ক দেখুন <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-between">
              <Link to="/dashboard/withdrawals">
                উত্তোলনের অনুরোধ করুন <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-between">
              <Link to="/dashboard/referrals">
                বন্ধুদের আমন্ত্রণ জানান <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
