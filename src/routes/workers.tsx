import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { addWorker, deleteWorker, useWorkers } from "@/lib/storage";
import { fmtINR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/workers")({
  component: () => (
    <AppLayout>
      <WorkersPage />
    </AppLayout>
  ),
});

function WorkersPage() {
  const workers = useWorkers();
  const [form, setForm] = useState({ name: "", role: "", phone: "", dailyWage: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) return toast.error("Name and role required");
    addWorker({
      name: form.name.trim(),
      role: form.role.trim(),
      phone: form.phone.trim(),
      dailyWage: Number(form.dailyWage) || 0,
    });
    setForm({ name: "", role: "", phone: "", dailyWage: "" });
    toast.success("Worker added");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workers</h1>
        <p className="text-sm text-muted-foreground">Mesthri, masons, helpers, electricians, plumbers…</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Add worker</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-[1fr_1fr_180px_140px_auto]">
            <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Role</Label><Input placeholder="Mason, Helper…" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Daily wage</Label><Input type="number" value={form.dailyWage} onChange={(e) => setForm({ ...form, dailyWage: e.target.value })} /></div>
            <div className="flex items-end"><Button type="submit"><Plus className="size-4" /> Add</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Daily wage</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">No workers yet.</TableCell></TableRow>
              )}
              {workers.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.name}</TableCell>
                  <TableCell>{w.role}</TableCell>
                  <TableCell>{w.phone || "—"}</TableCell>
                  <TableCell className="text-right">{fmtINR(w.dailyWage)}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => {
                      deleteWorker(w.id);
                      toast.success("Worker removed");
                    }}>
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