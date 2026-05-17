import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useExpenses } from "@/lib/storage";
import { fmtDate, fmtINR } from "@/lib/format";

export const Route = createFileRoute("/materials")({
  component: () => (
    <AppLayout>
      <MaterialsPage />
    </AppLayout>
  ),
});

function MaterialsPage() {
  const expenses = useExpenses();
  const materials = useMemo(
    () =>
      expenses
        .filter((e) => e.category === "Material")
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [expenses],
  );
  const total = materials.reduce((a, e) => a + Number(e.amount || 0), 0);

  const bySub = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of materials) {
      const k = m.subcategory || "Other";
      map.set(k, (map.get(k) || 0) + Number(m.amount || 0));
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [materials]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Materials</h1>
        <p className="text-sm text-muted-foreground">{materials.length} purchases · {fmtINR(total)} total</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">By material</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {bySub.length === 0 && <div className="text-sm text-muted-foreground">No material purchases yet.</div>}
            {bySub.map(([name, amt]) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span>{name}</span>
                <span className="font-medium">{fmtINR(amt)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">No material expenses recorded.</TableCell></TableRow>
                )}
                {materials.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="whitespace-nowrap">{fmtDate(m.date)}</TableCell>
                    <TableCell className="font-medium">{m.subcategory || "—"}</TableCell>
                    <TableCell>{m.shop || "—"}</TableCell>
                    <TableCell className="text-right">{fmtINR(m.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}