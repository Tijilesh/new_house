import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getBudgets, setBudgets, useBudgets, useExpenses, useCategories, setCategoriesList, getCategories,
} from "@/lib/storage";
import { fmtINR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/budget")({
  component: () => (
    <AppLayout>
      <BudgetPage />
    </AppLayout>
  ),
});

function BudgetPage() {
  const budgets = useBudgets();
  const expenses = useExpenses();
  const categories = useCategories();

  const [newCat, setNewCat] = useState("");
  const [newBudget, setNewBudget] = useState("");

  const usage = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of expenses) {
      m.set(e.category, (m.get(e.category) || 0) + Number(e.amount || 0));
    }
    return m;
  }, [expenses]);

  const setOne = (cat: string, val: number) => {
    const next = getBudgets();
    const idx = next.findIndex((b) => b.category === cat);
    if (idx >= 0) next[idx] = { category: cat, budget: val };
    else next.push({ category: cat, budget: val });
    setBudgets(next);
  };

  const addCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCat.trim();
    if (!name) return;
    if (categories.includes(name)) return toast.error("Category already exists");
    setCategoriesList([...getCategories(), name]);
    setOne(name, Number(newBudget) || 0);
    setNewCat("");
    setNewBudget("");
    toast.success("Category added");
  };

  const removeCategory = (cat: string) => {
    if (!confirm(`Remove "${cat}" category and its budget?`)) return;
    setCategoriesList(getCategories().filter((c) => c !== cat));
    setBudgets(getBudgets().filter((b) => b.category !== cat));
    toast.success("Category removed");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Budget Planner</h1>
        <p className="text-sm text-muted-foreground">Set a budget per category and watch usage in real time.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Add category</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={addCategory} className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <div className="space-y-1.5"><Label>Category name</Label><Input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="e.g. Solar, CCTV" /></div>
            <div className="space-y-1.5"><Label>Budget (₹)</Label><Input type="number" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} /></div>
            <div className="flex items-end"><Button type="submit"><Plus className="size-4" /> Add</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Category budgets</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {categories.map((cat) => {
            const b = budgets.find((x) => x.category === cat)?.budget ?? 0;
            const used = usage.get(cat) || 0;
            const pct = b ? Math.min(100, (used / b) * 100) : 0;
            const over = used > b && b > 0;
            return (
              <div key={cat} className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="font-medium min-w-[120px]">{cat}</div>
                  <Input
                    type="number"
                    className="w-40"
                    value={b || ""}
                    placeholder="Budget"
                    onChange={(e) => setOne(cat, Number(e.target.value) || 0)}
                  />
                  <div className={`text-sm ${over ? "text-destructive" : "text-muted-foreground"}`}>
                    Used {fmtINR(used)} {b > 0 && <>· {pct.toFixed(0)}%</>}
                  </div>
                  <div className="flex-1" />
                  <Button size="icon" variant="ghost" onClick={() => removeCategory(cat)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <Progress value={pct} className={over ? "[&>div]:bg-destructive" : ""} />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}