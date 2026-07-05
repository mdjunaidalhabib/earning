import { Menu, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, initials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function DashboardTopbar({ onMenuClick, showBalance = true }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      const wasAdmin = user?.role === "admin";
      await logout();
      toast.success("Logged out successfully");
      navigate(wasAdmin ? "/admin/login" : "/login");
    } catch {
      toast.error("Trouble logging out");
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-foreground hover:bg-muted lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3 sm:gap-4">
        {showBalance && (
          <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary px-3.5 py-1.5 sm:flex">
            <span className="eyebrow !text-[10px] text-muted-foreground">Balance</span>
            <span className="balance-figure text-sm text-primary">
              {formatCurrency(user?.balance)}
            </span>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brass">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={user?.avatar?.url} alt={user?.name} />
              <AvatarFallback>{initials(user?.name)}</AvatarFallback>
            </Avatar>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
              <p className="truncate text-xs font-normal text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(user?.role === "admin" ? "/admin/profile" : "/dashboard/profile")}>
              <UserIcon className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-rust focus:text-rust">
              <LogOut className="h-4 w-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
