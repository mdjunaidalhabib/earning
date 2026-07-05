import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function FullScreenLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-ink">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brass/30 border-t-brass" />
        <p className="text-sm font-medium text-paper/70">Loading your ledger…</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ adminOnly = false }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullScreenLoader />;

  if (!isAuthenticated) {
    return (
      <Navigate to={adminOnly ? "/admin/login" : "/login"} state={{ from: location }} replace />
    );
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // A regular user token should never grant access to user-only routes if it
  // somehow belongs to an admin account — keep the portals fully separate.
  if (!adminOnly && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export function GuestOnlyRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) return <FullScreenLoader />;

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  }

  return <Outlet />;
}
