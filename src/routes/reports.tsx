import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useExpenses } from "@/lib/storage";
import { fmtDate, fmtINR, isSameDay, isSameMonth } from "@/lib/format";

export const Route = createFileRoute("/reports")({
  component: () => (
    <AppLayout>
      <ReportsPage />
    </AppLayout>
  ),
});

type Range = "today" | "week" | "month" | "all";

function inRange(iso: string, r: Range) {
  if (r === "all") return true;
  if (r === "today") return isSameDay(iso);
  if (r === "month") return isSameMonth(iso);
  if (r === "week") {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 86400000;
    return diff <= 7 && diff >= -1;
  }
  return true;
}

function toCSV(rows: string[][]) {
  return rows
    .map((r) =>
      r
        .map((c) => {
          const v = String(c ?? "");
          return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
        })
        .join(","),
    )
    .join("\n");
}

function ReportsPage() {
  const expenses = useExpenses();
  const [range, setRange] = useState<Range>("month");

  const filtered = useMemo(
    () => expenses.filter((e) => inRange(e.date, range)).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [expenses, range],
  );

  const byCat = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of filtered) m.set(e.category, (m.get(e.category) || 0) + Number(e.amount || 0));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const total = filtered.reduce((a, e) => a + Number(e.amount || 0), 0);

  const exportCSV = () => {
    const rows: string[][] = [
      ["Date", "Category", "Subcategory", "Work Stage", "Shop/Person", "Payment Mode", "Status", "Amount (INR)", "Notes"],
      ...filtered.map((e) => [
        fmtDate(e.date),
        e.category,
        e.subcategory,
        e.workStage,
        e.shop,
        e.paymentMode,
        e.paid ? "Paid" : "Pending",
        String(e.amount),
        e.notes ?? "",
      ]),
    ];
    const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `buildtrack-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} entries · {fmtINR(total)}</p>
        </div>
        <div className="flex gap-2">
          <Select value={range} onValueChange={(v) => setRange(v as Range)}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportCSV} variant="outline"><Download className="size-4" /> Export CSV</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Category breakdown</CardTitle></CardHeader>
        <CardContent>
          {byCat.length === 0 ? (
            <div className="text-sm text-muted-foreground">No data in this range.</div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {byCat.map(([c, amt]) => (
                <div key={c} className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">{c}</div>
                  <div className="text-lg font-semibold">{fmtINR(amt)}</div>
                  <div className="text-xs text-muted-foreground">
                    {((amt / (total || 1)) * 100).toFixed(1)}% of total
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Shop / Person</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="whitespace-nowrap">{fmtDate(e.date)}</TableCell>
                  <TableCell>{e.category}</TableCell>
                  <TableCell>{e.subcategory || "—"}</TableCell>
                  <TableCell>{e.shop || "—"}</TableCell>
                  <TableCell>{e.paid ? "Paid" : "Pending"}</TableCell>
                  <TableCell className="text-right">{fmtINR(e.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}