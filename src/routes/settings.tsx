import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  setSettings, useSettings, useWorkStages, setWorkStages, getWorkStages,
} from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: () => (
    <AppLayout>
      <SettingsPage />
    </AppLayout>
  ),
});

function SettingsPage() {
  const s = useSettings();
  const stages = useWorkStages();
  const [name, setName] = useState(s.projectName);
  const [budget, setBudget] = useState(String(s.totalBudget));
  const [newStage, setNewStage] = useState("");

  const save = () => {
    setSettings({ projectName: name.trim() || "My House", totalBudget: Number(budget) || 0 });
    toast.success("Settings saved");
  };

  const addStage = (e: React.FormEvent) => {
    e.preventDefault();
    const v = newStage.trim();
    if (!v) return;
    if (stages.includes(v)) return toast.error("Already exists");
    setWorkStages([...getWorkStages(), v]);
    setNewStage("");
    toast.success("Stage added");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Project info, total budget and work stages.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Project</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Project name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Total budget (₹)</Label><Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} /></div>
          <div className="md:col-span-2"><Button onClick={save}>Save</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Work stages</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={addStage} className="flex gap-2 mb-4">
            <Input value={newStage} onChange={(e) => setNewStage(e.target.value)} placeholder="e.g. Painting" />
            <Button type="submit"><Plus className="size-4" /> Add</Button>
          </form>
          <ul className="divide-y border rounded-md">
            {stages.map((st) => (
              <li key={st} className="flex items-center justify-between px-3 py-2">
                <span>{st}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (!confirm(`Remove "${st}"?`)) return;
                    setWorkStages(getWorkStages().filter((s) => s !== st));
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Backend</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            This frontend persists everything to your browser (localStorage). When you connect your Spring Boot + MySQL backend,
            we'll swap the data layer in <code className="px-1 py-0.5 rounded bg-muted text-foreground">src/lib/storage.ts</code> with API calls
            and wire JWT to <code className="px-1 py-0.5 rounded bg-muted text-foreground">login()</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}