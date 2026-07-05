import { useEffect, useState } from "react";
import { Copy, Check, Users, Gift } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import { userService } from "@/api/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatCurrency, formatDate, initials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ReferralsPage() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;
  const totalBonusEarned = referrals
    .filter((r) => r.status === "credited")
    .reduce((sum, r) => sum + r.bonusAmount, 0);

  useEffect(() => {
    let isMounted = true;
    async function fetchReferrals() {
      try {
        const { data } = await userService.getReferrals();
        if (isMounted) setReferrals(data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load referrals");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchReferrals();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Referral
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          বন্ধুদের আমন্ত্রণ জানাও এবং যোগ দেওয়া প্রতিটি Referral-এর জন্য Bonus আয় করো।
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={Users} label="Total Referrals" value={referrals.length} accent="brass" />
        <StatCard
          icon={Gift}
          label="Bonus Earned"
          value={formatCurrency(totalBonusEarned)}
          accent="moss"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>
            এই Link শেয়ার করো — এর মাধ্যমে যে কেউ Sign Up করলে সে তোমার Referral হয়ে যাবে।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input readOnly value={referralLink} className="font-mono text-sm" />
            <Button variant="brass" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            অথবা সরাসরি তোমার Code শেয়ার করো:{" "}
            <span className="balance-figure text-foreground">{user?.referralCode}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : referrals.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No referrals yet"
              description="Share the link above to start earning referral bonuses."
            />
          ) : (
            <div className="divide-y divide-border">
              {referrals.map((r) => (
                <div key={r._id} className="flex items-center gap-4 py-4">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarFallback>{initials(r.referee?.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {r.referee?.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Joined on {formatDate(r.referee?.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="balance-figure text-sm text-moss">
                      +{formatCurrency(r.bonusAmount)}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
