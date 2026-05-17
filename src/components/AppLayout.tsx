import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  Users,
  Package,
  PieChart,
  FileBarChart,
  Settings as SettingsIcon,
  LogOut,
  HardHat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout, useAuth, useEnsureSeed, useSettings } from "@/lib/storage";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/expenses/new", label: "Add Expense", icon: PlusCircle },
  { to: "/workers", label: "Workers", icon: Users },
  { to: "/materials", label: "Materials", icon: Package },
  { to: "/budget", label: "Budget", icon: PieChart },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppLayout({ children }: { children: React.ReactNode }) {
  useEnsureSeed();
  const auth = useAuth();
  const settings = useSettings();
  const nav = useNavigate();
  const loc = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !auth.token) nav({ to: "/login" });
  }, [mounted, auth.token, nav]);

  if (!auth.token) {
    return (
      <div className="min-h-screen grid place-items-center bg-muted/30">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="size-10 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <HardHat className="size-5" />
          </div>
          <div className="text-sm">
            {mounted ? "Redirecting to login…" : "Loading BuildTrack…"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground min-h-screen sticky top-0">
          <div className="px-6 py-5 border-b border-sidebar-border flex items-center gap-2">
            <div className="size-9 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center">
              <HardHat className="size-5" />
            </div>
            <div>
              <div className="font-semibold leading-tight">BuildTrack</div>
              <div className="text-xs text-muted-foreground">{settings.projectName}</div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? loc.pathname === "/"
                  : loc.pathname === item.to ||
                    (item.to !== "/expenses/new" && loc.pathname.startsWith(item.to + "/"));
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-sidebar-border">
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Signed in as <span className="font-medium text-sidebar-foreground">{auth.user}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                logout();
                nav({ to: "/login" });
              }}
            >
              <LogOut className="size-4" /> Log out
            </Button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {/* Mobile header */}
          <header className="lg:hidden flex items-center justify-between border-b bg-background px-4 py-3 sticky top-0 z-30">
            <Link to="/" className="flex items-center gap-2">
              <div className="size-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
                <HardHat className="size-4" />
              </div>
              <div className="font-semibold">BuildTrack</div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                nav({ to: "/login" });
              }}
            >
              <LogOut className="size-4" />
            </Button>
          </header>

          <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">{children}</main>

          {/* Mobile bottom nav */}
          <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-background border-t flex justify-around py-2 z-30">
            {NAV.slice(0, 5).map((item) => {
              const active = item.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center text-[11px] px-2 py-1 rounded-md",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" />
                  <span className="mt-0.5">{item.label.split(" ")[0]}</span>
                </Link>
              );
            })}
          </nav>
          <div className="h-16 lg:hidden" />
        </div>
      </div>
    </div>
  );
}