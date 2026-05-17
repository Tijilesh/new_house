import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Calendar,
  Sofa,
  Trees,
  HardHat,
  Package,
  AlertCircle,
  Users,
  PiggyBank,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import {
  useExpenses,
  useSettings,
  useWorkers,
  useBudgets,
} from "@/lib/storage";
import { fmtINR, fmtDate, isSameDay, isSameMonth } from "@/lib/format";

export const Route = createFileRoute("/")({
  component: () => (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  ),
});

function Stat({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  tone?: "default" | "success" | "warn" | "danger";
}) {
  const toneClass = {
    default: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warn: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    danger: "bg-destructive/10 text-destructive",
  }[tone];
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`size-11 rounded-lg grid place-items-center ${toneClass}`}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-semibold truncate">{value}</div>
          {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const expenses = useExpenses();
  const settings = useSettings();
  const workers = useWorkers();
  const budgets = useBudgets();

  const totals = useMemo(() => {
    const sum = (xs: typeof expenses) => xs.reduce((a, e) => a + Number(e.amount || 0), 0);
    const byCat = (c: string) => sum(expenses.filter((e) => e.category === c));
    const today = sum(expenses.filter((e) => isSameDay(e.date)));
    const month = sum(expenses.filter((e) => isSameMonth(e.date)));
    const total = sum(expenses);
    const pending = sum(expenses.filter((e) => !e.paid));
    return {
      total,
      today,
      month,
      pending,
      material: byCat("Material"),
      labour: byCat("Labour"),
      interior: byCat("Interior"),
      exterior: byCat("Exterior"),
      pendingCount: expenses.filter((e) => !e.paid).length,
      materialCount: expenses.filter((e) => e.category === "Material").length,
    };
  }, [expenses]);

  const remaining = Math.max(0, settings.totalBudget - totals.total);
  const usedPct = settings.totalBudget
    ? Math.min(100, (totals.total / settings.totalBudget) * 100)
    : 0;

  const recent = [...expenses]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of <span className="font-medium">{settings.projectName}</span>
          </p>
        </div>
        <Button asChild>
          <Link to="/expenses/new">+ Add Expense</Link>
        </Button>
      </div>

      {/* Budget card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Budget</div>
              <div className="text-3xl font-semibold">{fmtINR(settings.totalBudget)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Used</div>
              <div className="text-xl font-semibold">{fmtINR(totals.total)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Remaining</div>
              <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                {fmtINR(remaining)}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={usedPct} />
            <div className="mt-2 text-xs text-muted-foreground">
              {usedPct.toFixed(1)}% of total budget used
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Stat label="Total Spent" value={fmtINR(totals.total)} icon={Wallet} />
        <Stat label="Today" value={fmtINR(totals.today)} icon={Calendar} tone="success" />
        <Stat label="This Month" value={fmtINR(totals.month)} icon={TrendingUp} />
        <Stat
          label="Pending Payments"
          value={fmtINR(totals.pending)}
          icon={AlertCircle}
          tone={totals.pending > 0 ? "danger" : "default"}
          hint={`${totals.pendingCount} unpaid`}
        />
        <Stat label="Material" value={fmtINR(totals.material)} icon={Package} />
        <Stat label="Labour" value={fmtINR(totals.labour)} icon={HardHat} />
        <Stat label="Interior" value={fmtINR(totals.interior)} icon={Sofa} />
        <Stat label="Exterior" value={fmtINR(totals.exterior)} icon={Trees} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Budget breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Budget by Category</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/budget">
                Manage <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgets.map((b) => {
              const used = expenses
                .filter((e) => e.category === b.category)
                .reduce((a, e) => a + Number(e.amount || 0), 0);
              const pct = b.budget ? Math.min(100, (used / b.budget) * 100) : 0;
              const over = used > b.budget;
              return (
                <div key={b.category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="font-medium">{b.category}</div>
                    <div className={over ? "text-destructive" : "text-muted-foreground"}>
                      {fmtINR(used)} / {fmtINR(b.budget)}
                    </div>
                  </div>
                  <Progress value={pct} className={over ? "[&>div]:bg-destructive" : ""} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick info */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="size-11 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <Users className="size-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Workers</div>
                <div className="text-xl font-semibold">{workers.length}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="size-11 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <PiggyBank className="size-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Remaining Budget</div>
                <div className="text-xl font-semibold">{fmtINR(remaining)}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="size-11 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 grid place-items-center">
                <TrendingDown className="size-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Pending Bills</div>
                <div className="text-xl font-semibold">{totals.pendingCount}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Expenses</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/expenses">
              View all <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No expenses yet.{" "}
              <Link to="/expenses/new" className="text-primary underline">
                Add your first one
              </Link>
              .
            </div>
          ) : (
            <ul className="divide-y">
              {recent.map((e) => (
                <li key={e.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">
                        {e.subcategory || e.category}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {e.category}
                      </Badge>
                      {!e.paid && (
                        <Badge variant="destructive" className="text-[10px]">
                          Pending
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {fmtDate(e.date)} · {e.shop || "—"} · {e.workStage}
                    </div>
                  </div>
                  <div className="text-right font-semibold">{fmtINR(e.amount)}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
