import { Routes, Route } from "react-router-dom";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { UserDashboardLayout } from "@/components/layout/UserDashboardLayout";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { ProtectedRoute, GuestOnlyRoute } from "@/routes/ProtectedRoute";

import LandingPage from "@/pages/LandingPage";
import HowItWorksPage from "@/pages/HowItWorksPage";
import NotFoundPage from "@/pages/NotFoundPage";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";

import UserOverviewPage from "@/pages/user/UserOverviewPage";
import TasksPage from "@/pages/user/TasksPage";
import TaskDetailPage from "@/pages/user/TaskDetailPage";
import WithdrawalsPage from "@/pages/user/WithdrawalsPage";
import ReferralsPage from "@/pages/user/ReferralsPage";
import UserProfilePage from "@/pages/user/UserProfilePage";

import AdminOverviewPage from "@/pages/admin/AdminOverviewPage";
import AdminTasksPage from "@/pages/admin/AdminTasksPage";
import AdminSubmissionsPage from "@/pages/admin/AdminSubmissionsPage";
import AdminWithdrawalsPage from "@/pages/admin/AdminWithdrawalsPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminProfilePage from "@/pages/admin/AdminProfilePage";

export default function App() {
  return (
    <Routes>
      {/* Public marketing pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
      </Route>

      {/* Guest-only auth pages (redirect away if already logged in) */}
      <Route element={<GuestOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* User dashboard (protected) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<UserDashboardLayout />}>
          <Route path="/dashboard" element={<UserOverviewPage />} />
          <Route path="/dashboard/tasks" element={<TasksPage />} />
          <Route path="/dashboard/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/dashboard/withdrawals" element={<WithdrawalsPage />} />
          <Route path="/dashboard/referrals" element={<ReferralsPage />} />
          <Route path="/dashboard/profile" element={<UserProfilePage />} />
        </Route>
      </Route>

      {/* Admin dashboard (protected + admin-only) */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<AdminDashboardLayout />}>
          <Route path="/admin" element={<AdminOverviewPage />} />
          <Route path="/admin/tasks" element={<AdminTasksPage />} />
          <Route path="/admin/submissions" element={<AdminSubmissionsPage />} />
          <Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
