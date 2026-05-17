import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Trash2, Check, X } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteExpense,
  updateExpense,
  useCategories,
  useExpenses,
} from "@/lib/storage";
import { fmtDate, fmtINR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/expenses/")({
  component: () => (
    <AppLayout>
      <ExpensesPage />
    </AppLayout>
  ),
});

function ExpensesPage() {
  const expenses = useExpenses();
  const categories = useCategories();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return expenses
      .filter((e) => (cat === "all" ? true : e.category === cat))
      .filter((e) =>
        status === "all" ? true : status === "paid" ? e.paid : !e.paid,
      )
      .filter((e) => {
        if (!ql) return true;
        return [e.subcategory, e.shop, e.workStage, e.notes, e.category, e.paymentMode, e.date]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(ql));
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [expenses, q, cat, status]);

  const total = filtered.reduce((a, e) => a + Number(e.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} entries · {fmtINR(total)} total
          </p>
        </div>
        <Button asChild>
          <Link to="/expenses/new">+ Add Expense</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by date, shop, material, worker, notes…"
              className="pl-9"
            />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
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
                <TableHead className="hidden md:table-cell">Stage</TableHead>
                <TableHead className="hidden md:table-cell">Shop / Person</TableHead>
                <TableHead className="hidden lg:table-cell">Mode</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[110px]">Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-sm text-muted-foreground">
                    No expenses match your filters.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="whitespace-nowrap">{fmtDate(e.date)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{e.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{e.subcategory || "—"}</div>
                    {e.notes && (
                      <div className="text-xs text-muted-foreground truncate max-w-[240px]">
                        {e.notes}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{e.workStage}</TableCell>
                  <TableCell className="hidden md:table-cell">{e.shop || "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell">{e.paymentMode}</TableCell>
                  <TableCell className="text-right font-semibold whitespace-nowrap">
                    {fmtINR(e.amount)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={e.paid ? "outline" : "default"}
                      className="h-7 gap-1"
                      onClick={() => {
                        updateExpense(e.id, { paid: !e.paid });
                        toast.success(e.paid ? "Marked as pending" : "Marked as paid");
                      }}
                    >
                      {e.paid ? <><Check className="size-3" /> Paid</> : <><X className="size-3" /> Pending</>}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        deleteExpense(e.id);
                        toast.success("Expense deleted");
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}