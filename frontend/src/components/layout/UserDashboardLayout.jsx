import { useState } from "react";
import { Outlet } from "react-router-dom";
import { LayoutDashboard, ListChecks, Wallet, Users, UserCircle } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/tasks", label: "Earn by Completing Tasks", icon: ListChecks },
  { to: "/dashboard/withdrawals", label: "Withdrawal", icon: Wallet },
  { to: "/dashboard/referrals", label: "Referral", icon: Users },
  { to: "/dashboard/profile", label: "Profile", icon: UserCircle },
];

export function UserDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        navItems={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        brandLabel="EarnLedger"
      />

      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
