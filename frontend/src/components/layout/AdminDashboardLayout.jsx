import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  ClipboardCheck,
  Wallet,
  Users,
  UserCircle,
} from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";

const navItems = [
  { to: "/admin", label: "সংক্ষিপ্ত বিবরণ", icon: LayoutDashboard, end: true },
  { to: "/admin/tasks", label: "টাস্ক ব্যবস্থাপনা", icon: ListChecks },
  { to: "/admin/submissions", label: "সাবমিশন পর্যালোচনা", icon: ClipboardCheck },
  { to: "/admin/withdrawals", label: "উত্তোলন", icon: Wallet },
  { to: "/admin/users", label: "ইউজার", icon: Users },
  { to: "/admin/profile", label: "প্রোফাইল", icon: UserCircle },
];

export function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        navItems={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        brandLabel="আর্নলেজার অ্যাডমিন"
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} showBalance={false} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
