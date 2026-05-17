import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addExpense,
  useCategories,
  useWorkStages,
  type PaymentMode,
} from "@/lib/storage";
import { todayISO } from "@/lib/format";
import { toast } from "sonner";

const MODES: PaymentMode[] = ["Cash", "UPI", "Bank Transfer", "Cheque", "Card"];

export const Route = createFileRoute("/expenses/new")({
  component: () => (
    <AppLayout>
      <AddExpensePage />
    </AppLayout>
  ),
});

function AddExpensePage() {
  const categories = useCategories();
  const stages = useWorkStages();
  const nav = useNavigate();

  const [form, setForm] = useState({
    date: todayISO(),
    workStage: stages[0] ?? "",
    category: categories[0] ?? "Material",
    subcategory: "",
    shop: "",
    amount: "",
    paymentMode: "UPI" as PaymentMode,
    notes: "",
    paid: true,
    bill: null as File | null,
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.date) return toast.error("Pick a date");
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    if (!form.category) return toast.error("Pick a category");
    addExpense({
      date: form.date,
      workStage: form.workStage,
      category: form.category,
      subcategory: form.subcategory.trim(),
      shop: form.shop.trim(),
      amount,
      paymentMode: form.paymentMode,
      notes: form.notes.trim(),
      paid: form.paid,
    });
    toast.success("Expense added");
    nav({ to: "/expenses" });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Expense</h1>
        <p className="text-sm text-muted-foreground">Record a daily construction expense</p>
      </div>

      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expense details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Work Stage</Label>
              <Select value={form.workStage} onValueChange={(v) => update("workStage", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub">Subcategory / Item</Label>
              <Input
                id="sub"
                placeholder="e.g. Cement, Mason, Tiles"
                value={form.subcategory}
                onChange={(e) => update("subcategory", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop">Shop / Person</Label>
              <Input
                id="shop"
                placeholder="e.g. Sri Lakshmi Traders"
                value={form.shop}
                onChange={(e) => update("shop", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amt">Amount (₹)</Label>
              <Input
                id="amt"
                type="number"
                inputMode="decimal"
                min={0}
                placeholder="0"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select
                value={form.paymentMode}
                onValueChange={(v) => update("paymentMode", v as PaymentMode)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODES.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2 md:col-span-1">
              <div>
                <Label htmlFor="paid" className="cursor-pointer">Already paid?</Label>
                <div className="text-xs text-muted-foreground">Toggle off to track as pending</div>
              </div>
              <Switch id="paid" checked={form.paid} onCheckedChange={(v) => update("paid", v)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="e.g. 50 cement bags, half advance paid"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bill">Bill upload (image / PDF)</Label>
              <Input
                id="bill"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => update("bill", e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">
                Note: bills are not persisted in the frontend-only build. We'll wire this once the backend is connected.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-end mt-4">
          <Button type="button" variant="outline" onClick={() => nav({ to: "/expenses" })}>
            Cancel
          </Button>
          <Button type="submit">Save Expense</Button>
        </div>
      </form>
    </div>
  );
}