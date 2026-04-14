import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, Save, X, ArrowDown, GripVertical, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserFlow {
  id: string;
  module_id: string;
  flow_name: string;
  flow_type: string;
  steps_json: any;
  role_type: string;
  version: string | null;
  created_at: string;
  updated_at: string;
}

interface FlowStep {
  id: string;
  flow_id: string;
  step_number: number;
  step_title: string;
  step_description: string | null;
  system_action: string | null;
  expected_result: string | null;
}

interface Props {
  moduleId: string;
  moduleName: string;
}

const FLOW_TYPE_COLORS: Record<string, string> = {
  primary: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  alternate: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  edge: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

const ROLE_COLORS: Record<string, string> = {
  user: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  guest: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  moderator: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const emptyForm = { flow_name: "", flow_type: "primary", role_type: "user", version: "1.0" };
const emptyStep = { step_title: "", step_description: "", system_action: "", expected_result: "" };

export default function DocUserFlows({ moduleId, moduleName }: Props) {
  const [flows, setFlows] = useState<UserFlow[]>([]);
  const [steps, setSteps] = useState<Record<string, FlowStep[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Edit/Add flow dialog
  const [flowDialog, setFlowDialog] = useState<"add" | "edit" | null>(null);
  const [editingFlow, setEditingFlow] = useState<UserFlow | null>(null);
  const [flowForm, setFlowForm] = useState(emptyForm);

  // Step editing
  const [editingStepsFor, setEditingStepsFor] = useState<string | null>(null);
  const [editSteps, setEditSteps] = useState<(FlowStep & { _new?: boolean })[]>([]);

  const loadFlows = async () => {
    setLoading(true);
    const { data: flowData } = await supabase
      .from("documentation_user_flows")
      .select("*")
      .eq("module_id", moduleId)
      .order("created_at");

    const loadedFlows = (flowData || []) as UserFlow[];
    setFlows(loadedFlows);

    if (loadedFlows.length > 0) {
      const { data: stepData } = await supabase
        .from("documentation_flow_steps")
        .select("*")
        .in("flow_id", loadedFlows.map(f => f.id))
        .order("step_number");

      const grouped: Record<string, FlowStep[]> = {};
      (stepData || []).forEach((s: any) => {
        if (!grouped[s.flow_id]) grouped[s.flow_id] = [];
        grouped[s.flow_id].push(s as FlowStep);
      });
      setSteps(grouped);
    }
    setLoading(false);
  };

  useEffect(() => { loadFlows(); }, [moduleId]);

  const filtered = useMemo(() => {
    return flows.filter(f => {
      const matchSearch = !search || f.flow_name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || f.flow_type === typeFilter;
      const matchRole = roleFilter === "all" || f.role_type === roleFilter;
      return matchSearch && matchType && matchRole;
    });
  }, [flows, search, typeFilter, roleFilter]);

  const handleSaveFlow = async () => {
    if (flowDialog === "add") {
      const { error } = await supabase.from("documentation_user_flows").insert({
        module_id: moduleId,
        flow_name: flowForm.flow_name,
        flow_type: flowForm.flow_type,
        role_type: flowForm.role_type,
        version: flowForm.version,
      });
      if (error) { toast.error("Failed to add flow"); return; }
      toast.success("Flow added");
    } else if (flowDialog === "edit" && editingFlow) {
      const { error } = await supabase.from("documentation_user_flows").update({
        flow_name: flowForm.flow_name,
        flow_type: flowForm.flow_type,
        role_type: flowForm.role_type,
        version: flowForm.version,
        updated_at: new Date().toISOString(),
      }).eq("id", editingFlow.id);
      if (error) { toast.error("Failed to update flow"); return; }
      toast.success("Flow updated");
    }
    setFlowDialog(null);
    setEditingFlow(null);
    setFlowForm(emptyForm);
    loadFlows();
  };

  const handleDeleteFlow = async (id: string) => {
    const { error } = await supabase.from("documentation_user_flows").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Flow deleted");
    loadFlows();
  };

  const openEditFlow = (f: UserFlow) => {
    setEditingFlow(f);
    setFlowForm({ flow_name: f.flow_name, flow_type: f.flow_type, role_type: f.role_type, version: f.version || "1.0" });
    setFlowDialog("edit");
  };

  const openStepEditor = (flowId: string) => {
    setEditingStepsFor(flowId);
    setEditSteps([...(steps[flowId] || [])]);
  };

  const addStep = () => {
    setEditSteps(prev => [...prev, {
      id: crypto.randomUUID(),
      flow_id: editingStepsFor!,
      step_number: prev.length + 1,
      step_title: "",
      step_description: null,
      system_action: null,
      expected_result: null,
      _new: true,
    }]);
  };

  const removeStep = (idx: number) => {
    setEditSteps(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step_number: i + 1 })));
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= editSteps.length) return;
    const arr = [...editSteps];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    setEditSteps(arr.map((s, i) => ({ ...s, step_number: i + 1 })));
  };

  const updateStep = (idx: number, field: string, value: string) => {
    setEditSteps(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const handleSaveSteps = async () => {
    if (!editingStepsFor) return;
    // Delete all existing steps for this flow, then re-insert
    await supabase.from("documentation_flow_steps").delete().eq("flow_id", editingStepsFor);

    const inserts = editSteps.map((s, i) => ({
      flow_id: editingStepsFor,
      step_number: i + 1,
      step_title: s.step_title,
      step_description: s.step_description || null,
      system_action: s.system_action || null,
      expected_result: s.expected_result || null,
    }));

    if (inserts.length > 0) {
      const { error } = await supabase.from("documentation_flow_steps").insert(inserts);
      if (error) { toast.error("Failed to save steps"); return; }
    }
    toast.success("Steps saved");
    setEditingStepsFor(null);
    loadFlows();
  };

  if (loading) return <div className="text-sm text-muted-foreground py-4">Loading user flows...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h4 className="font-semibold text-sm">User Flows — {moduleName}</h4>
        <Button size="sm" onClick={() => { setFlowForm(emptyForm); setFlowDialog("add"); }}>
          <Plus className="w-3 h-3 mr-1" /> Add Flow
        </Button>
      </div>

      {flows.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search flows..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="alternate">Alternate</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="edge">Edge Case</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="guest">Guest</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="border border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground">
          No user flows yet — click "Add Flow" to create one
        </div>
      )}

      {filtered.map(flow => {
        const flowSteps = steps[flow.id] || [];
        return (
          <Card key={flow.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{flow.flow_name}</span>
                <Badge className={`text-[10px] ${FLOW_TYPE_COLORS[flow.flow_type] || ""}`}>{flow.flow_type}</Badge>
                <Badge className={`text-[10px] ${ROLE_COLORS[flow.role_type] || ""}`}>{flow.role_type}</Badge>
                {flow.version && <Badge variant="outline" className="text-[10px]">v{flow.version}</Badge>}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditFlow(flow)}><Edit className="w-3 h-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openStepEditor(flow.id)}><GripVertical className="w-3 h-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteFlow(flow.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>

            {/* Visual flow diagram */}
            {flowSteps.length > 0 ? (
              <div className="flex flex-col items-start gap-0 ml-2">
                {flowSteps.map((step, i) => (
                  <div key={step.id} className="flex flex-col items-start">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                          {step.step_number}
                        </div>
                        {i < flowSteps.length - 1 && <div className="w-0.5 h-6 bg-border" />}
                      </div>
                      <div className="pt-0.5">
                        <p className="text-sm font-medium">{step.step_title}</p>
                        {step.step_description && <p className="text-xs text-muted-foreground">{step.step_description}</p>}
                        {step.system_action && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <span className="font-medium">System:</span> {step.system_action}
                          </p>
                        )}
                        {step.expected_result && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <span className="font-medium">Result:</span> {step.expected_result}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No steps defined — click the reorder icon to add steps</p>
            )}

            <div className="text-[10px] text-muted-foreground">
              Updated: {new Date(flow.updated_at).toLocaleString()}
            </div>
          </Card>
        );
      })}

      {/* Add/Edit Flow Dialog */}
      <Dialog open={!!flowDialog} onOpenChange={open => { if (!open) { setFlowDialog(null); setEditingFlow(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{flowDialog === "add" ? "Add User Flow" : "Edit User Flow"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Flow Name</Label><Input value={flowForm.flow_name} onChange={e => setFlowForm(p => ({ ...p, flow_name: e.target.value }))} placeholder="e.g., Submit Prayer Request" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={flowForm.flow_type} onValueChange={v => setFlowForm(p => ({ ...p, flow_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="alternate">Alternate</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="edge">Edge Case</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Role</Label>
                <Select value={flowForm.role_type} onValueChange={v => setFlowForm(p => ({ ...p, role_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Version</Label><Input value={flowForm.version} onChange={e => setFlowForm(p => ({ ...p, version: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setFlowDialog(null); setEditingFlow(null); }}>Cancel</Button>
            <Button onClick={handleSaveFlow} disabled={!flowForm.flow_name}><Save className="w-4 h-4 mr-1" /> Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Step Editor Dialog */}
      <Dialog open={!!editingStepsFor} onOpenChange={open => { if (!open) setEditingStepsFor(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Steps</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {editSteps.map((step, idx) => (
              <Card key={step.id} className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Step {idx + 1}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6" disabled={idx === 0} onClick={() => moveStep(idx, -1)}>↑</Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" disabled={idx === editSteps.length - 1} onClick={() => moveStep(idx, 1)}>↓</Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeStep(idx)}><X className="w-3 h-3" /></Button>
                  </div>
                </div>
                <Input placeholder="Step title" value={step.step_title} onChange={e => updateStep(idx, "step_title", e.target.value)} className="h-8 text-sm" />
                <Input placeholder="Description (optional)" value={step.step_description || ""} onChange={e => updateStep(idx, "step_description", e.target.value)} className="h-8 text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="System action (optional)" value={step.system_action || ""} onChange={e => updateStep(idx, "system_action", e.target.value)} className="h-8 text-sm" />
                  <Input placeholder="Expected result (optional)" value={step.expected_result || ""} onChange={e => updateStep(idx, "expected_result", e.target.value)} className="h-8 text-sm" />
                </div>
              </Card>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={addStep}>
              <Plus className="w-3 h-3 mr-1" /> Add Step
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStepsFor(null)}>Cancel</Button>
            <Button onClick={handleSaveSteps}><Save className="w-4 h-4 mr-1" /> Save Steps</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
