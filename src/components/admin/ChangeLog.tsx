import { useState, useEffect, useMemo } from "react";
import { History, Plus, Search, Filter, Edit, Save, X, Trash2, Link2, FileText, FlaskConical, Clock, ChevronDown, ChevronRight, StickyNote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocUpdate {
  id: string; update_id: string; title: string; summary: string | null;
  detailed_description: string | null; module_keys: string[]; submodule_keys: string[];
  change_type: string; affected_roles: string[]; flow_types: string[];
  source_reference: string | null; version_tag: string | null; status: string;
  created_by: string | null; created_at: string; updated_at: string;
}

interface UpdateNote {
  id: string; documentation_update_id: string; note_title: string;
  note_body: string | null; author: string | null; created_at: string;
}

interface TestLink {
  id: string; documentation_update_id: string; test_case_id: string;
  link_type: string; created_at: string;
}

interface DocModule { id: string; module_key: string; module_name: string; }
interface TestCase { id: string; title: string; module_id: string; status: string | null; }

const CHANGE_TYPES = ["feature", "ui", "logic", "validation", "permission", "bug_fix", "content", "admin", "testing"];
const STATUSES = ["logged", "in_review", "documentation_updated", "testing_pending", "testing_updated", "closed"];
const LINK_TYPES = ["created", "updated", "impacted", "needs_review"];

const TYPE_COLORS: Record<string, string> = {
  feature: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  ui: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  logic: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  validation: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  permission: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  bug_fix: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  content: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  testing: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
};

const STATUS_COLORS: Record<string, string> = {
  logged: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  in_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  documentation_updated: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  testing_pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  testing_updated: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const SEED_UPDATES: Omit<DocUpdate, "id" | "update_id" | "created_at" | "updated_at">[] = [
  { title: "Soft-delete & confirmation for Unit Testing", summary: "Added archive/restore workflow and confirmation dialog before deleting test cases", detailed_description: "Test cases now use a soft-delete pattern with an 'archived' boolean column. A confirmation dialog prevents accidental deletion. Archived cases can be viewed and restored.", module_keys: ["admin"], submodule_keys: ["unit-testing"], change_type: "feature", affected_roles: ["admin"], flow_types: ["admin"], source_reference: null, version_tag: "1.4", status: "closed", created_by: "system" },
  { title: "User Flow tab added to Documentation", summary: "Added database-backed User Flow tabs with step-by-step flow visualization for all documentation modules", detailed_description: "Created documentation_user_flows and documentation_flow_steps tables. Added DocUserFlows component with full CRUD, visual flow diagram, search, filtering by role and flow type. Pre-populated 28 flows with 90+ steps.", module_keys: ["admin"], submodule_keys: ["documentation"], change_type: "feature", affected_roles: ["admin"], flow_types: ["admin"], source_reference: null, version_tag: "1.5", status: "closed", created_by: "system" },
  { title: "Documentation & Testing sections made editable with DB persistence", summary: "All documentation content and test cases are now stored in database tables with full CRUD", detailed_description: "Migrated documentation from static data to documentation_modules, documentation_notes, documentation_screenshots tables. Test cases stored in test_cases and test_modules tables. Screenshot upload via storage bucket.", module_keys: ["admin"], submodule_keys: ["documentation", "unit-testing"], change_type: "feature", affected_roles: ["admin"], flow_types: ["admin"], source_reference: null, version_tag: "1.3", status: "closed", created_by: "system" },
  { title: "Change Tracking & Testing Sync system", summary: "Added automatic documentation update tracking and unit testing sync to Admin area", detailed_description: "New tables: documentation_updates, documentation_update_modules, documentation_update_notes, test_case_update_links, module_change_history. Master change log, module-level history, test case linkage, timeline view, and admin controls.", module_keys: ["admin"], submodule_keys: ["documentation", "unit-testing"], change_type: "feature", affected_roles: ["admin"], flow_types: ["admin"], source_reference: null, version_tag: "1.6", status: "logged", created_by: "system" },
];

interface ChangeLogProps {
  moduleFilter?: string; // If set, show only updates for this module_key
}

const ChangeLog = ({ moduleFilter }: ChangeLogProps) => {
  const [updates, setUpdates] = useState<DocUpdate[]>([]);
  const [updateNotes, setUpdateNotes] = useState<Record<string, UpdateNote[]>>({});
  const [testLinks, setTestLinks] = useState<Record<string, TestLink[]>>({});
  const [docModules, setDocModules] = useState<DocModule[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Create/Edit dialog
  const [editDialog, setEditDialog] = useState<DocUpdate | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<any>({});

  // Note dialog
  const [noteDialog, setNoteDialog] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({ title: "", body: "" });

  // Link dialog
  const [linkDialog, setLinkDialog] = useState<string | null>(null);
  const [selectedTestCases, setSelectedTestCases] = useState<{ id: string; linkType: string }[]>([]);

  const loadData = async () => {
    setLoading(true);
    const [{ data: ups }, { data: mods }, { data: tcs }] = await Promise.all([
      supabase.from("documentation_updates").select("*").order("created_at", { ascending: false }),
      supabase.from("documentation_modules").select("id, module_key, module_name"),
      supabase.from("test_cases").select("id, title, module_id, status").eq("archived", false),
    ]);

    if (!ups || ups.length === 0) {
      // Seed
      const { data: seeded } = await supabase.from("documentation_updates").insert(
        SEED_UPDATES.map(s => ({ ...s }))
      ).select();
      setUpdates((seeded || []) as DocUpdate[]);
    } else {
      setUpdates((ups || []) as DocUpdate[]);
    }

    setDocModules((mods || []) as DocModule[]);
    setTestCases((tcs || []) as TestCase[]);

    // Load notes and links for all updates
    const updateIds = (ups || []).map(u => u.id);
    if (updateIds.length > 0) {
      const [{ data: allNotes }, { data: allLinks }] = await Promise.all([
        supabase.from("documentation_update_notes").select("*").in("documentation_update_id", updateIds),
        supabase.from("test_case_update_links").select("*").in("documentation_update_id", updateIds),
      ]);
      const ng: Record<string, UpdateNote[]> = {};
      (allNotes || []).forEach((n: any) => { if (!ng[n.documentation_update_id]) ng[n.documentation_update_id] = []; ng[n.documentation_update_id].push(n); });
      setUpdateNotes(ng);
      const lg: Record<string, TestLink[]> = {};
      (allLinks || []).forEach((l: any) => { if (!lg[l.documentation_update_id]) lg[l.documentation_update_id] = []; lg[l.documentation_update_id].push(l); });
      setTestLinks(lg);
    }

    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const moduleNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    docModules.forEach(mod => { m[mod.module_key] = mod.module_name; });
    return m;
  }, [docModules]);

  const testCaseMap = useMemo(() => {
    const m: Record<string, TestCase> = {};
    testCases.forEach(tc => { m[tc.id] = tc; });
    return m;
  }, [testCases]);

  const filtered = useMemo(() => {
    return updates.filter(u => {
      if (moduleFilter && !u.module_keys.includes(moduleFilter)) return false;
      const matchSearch = !search || u.title.toLowerCase().includes(search.toLowerCase()) || (u.summary || "").toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || u.change_type === typeFilter;
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [updates, search, typeFilter, statusFilter, moduleFilter]);

  const openNew = () => {
    setIsNew(true);
    setForm({ title: "", summary: "", detailed_description: "", module_keys: moduleFilter ? [moduleFilter] : [], change_type: "feature", affected_roles: ["user"], version_tag: "", status: "logged", source_reference: "" });
    setEditDialog({} as any);
  };

  const openEdit = (u: DocUpdate) => {
    setIsNew(false);
    setForm({ title: u.title, summary: u.summary || "", detailed_description: u.detailed_description || "", module_keys: u.module_keys || [], change_type: u.change_type, affected_roles: u.affected_roles || [], version_tag: u.version_tag || "", status: u.status, source_reference: u.source_reference || "" });
    setEditDialog(u);
  };

  const handleSave = async () => {
    const payload = {
      title: form.title,
      summary: form.summary,
      detailed_description: form.detailed_description,
      module_keys: form.module_keys,
      change_type: form.change_type,
      affected_roles: form.affected_roles,
      version_tag: form.version_tag,
      status: form.status,
      source_reference: form.source_reference || null,
      updated_at: new Date().toISOString(),
    };
    if (isNew) {
      const { error } = await supabase.from("documentation_updates").insert({ ...payload, created_by: "Admin" });
      if (error) { toast.error("Failed to create"); return; }
      toast.success("Update logged");
    } else {
      const { error } = await supabase.from("documentation_updates").update(payload).eq("id", editDialog!.id);
      if (error) { toast.error("Failed to save"); return; }
      toast.success("Update saved");
    }
    setEditDialog(null);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("documentation_updates").delete().eq("id", id);
    toast.success("Update deleted");
    loadData();
  };

  const handleAddNote = async () => {
    if (!noteDialog) return;
    await supabase.from("documentation_update_notes").insert({
      documentation_update_id: noteDialog,
      note_title: noteForm.title,
      note_body: noteForm.body,
    });
    toast.success("Note added");
    setNoteDialog(null);
    setNoteForm({ title: "", body: "" });
    loadData();
  };

  const handleSaveLinks = async () => {
    if (!linkDialog) return;
    // Remove existing links for this update
    await supabase.from("test_case_update_links").delete().eq("documentation_update_id", linkDialog);
    if (selectedTestCases.length > 0) {
      await supabase.from("test_case_update_links").insert(
        selectedTestCases.map(tc => ({
          documentation_update_id: linkDialog,
          test_case_id: tc.id,
          link_type: tc.linkType,
        }))
      );
    }
    toast.success("Test case links saved");
    setLinkDialog(null);
    loadData();
  };

  const openLinkDialog = (updateId: string) => {
    const existing = (testLinks[updateId] || []).map(l => ({ id: l.test_case_id, linkType: l.link_type }));
    setSelectedTestCases(existing);
    setLinkDialog(updateId);
  };

  const toggleTestCase = (tcId: string) => {
    setSelectedTestCases(prev => {
      const exists = prev.find(p => p.id === tcId);
      if (exists) return prev.filter(p => p.id !== tcId);
      return [...prev, { id: tcId, linkType: "impacted" }];
    });
  };

  const updateLinkType = (tcId: string, linkType: string) => {
    setSelectedTestCases(prev => prev.map(p => p.id === tcId ? { ...p, linkType } : p));
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading change log...</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            {moduleFilter ? "Module Change History" : "Master Change Log"}
          </h3>
          <p className="text-xs text-muted-foreground">{filtered.length} updates tracked</p>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Log Update</Button>
      </div>

      {/* Filters */}
      {!moduleFilter && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search updates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-sm" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {CHANGE_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-2 border-l-2 border-border pl-4">
        {filtered.map(u => {
          const isExpanded = expandedId === u.id;
          const links = testLinks[u.id] || [];
          const notes = updateNotes[u.id] || [];
          return (
            <div key={u.id} className="relative">
              <div className="absolute -left-[1.35rem] top-2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
              <Card className="p-3">
                <div className="flex items-start gap-2 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : u.id)}>
                  {isExpanded ? <ChevronDown className="w-4 h-4 mt-0.5 shrink-0" /> : <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{u.title}</span>
                      <Badge className={`${TYPE_COLORS[u.change_type] || ""} text-[10px]`}>{u.change_type.replace("_", " ")}</Badge>
                      <Badge className={`${STATUS_COLORS[u.status] || ""} text-[10px]`}>{u.status.replace(/_/g, " ")}</Badge>
                      {u.version_tag && <Badge variant="outline" className="text-[10px]">v{u.version_tag}</Badge>}
                    </div>
                    {u.summary && <p className="text-xs text-muted-foreground mt-0.5 truncate">{u.summary}</p>}
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(u.created_at).toLocaleString()}</span>
                      <span>{u.created_by}</span>
                      {u.module_keys?.length > 0 && <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{u.module_keys.map(k => moduleNameMap[k] || k).join(", ")}</span>}
                      {links.length > 0 && <span className="flex items-center gap-1"><FlaskConical className="w-3 h-3" />{links.length} test cases</span>}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t space-y-3">
                    {u.detailed_description && <p className="text-sm text-muted-foreground">{u.detailed_description}</p>}
                    
                    <div className="flex flex-wrap gap-1">
                      {u.affected_roles?.map(r => <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>)}
                    </div>

                    {/* Linked test cases */}
                    {links.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold">Linked Test Cases:</span>
                        <div className="space-y-1 mt-1">
                          {links.map(l => {
                            const tc = testCaseMap[l.test_case_id];
                            return tc ? (
                              <div key={l.id} className="flex items-center gap-2 text-xs">
                                <Badge variant="outline" className="text-[10px]">{l.link_type}</Badge>
                                <span>{tc.title}</span>
                                <Badge className={`text-[10px] ${tc.status === "passed" ? "bg-green-100 text-green-800" : tc.status === "failed" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"}`}>{tc.status}</Badge>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {notes.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold">Notes:</span>
                        {notes.map(n => (
                          <div key={n.id} className="text-xs text-muted-foreground mt-1">
                            <span className="font-medium">{n.note_title}</span>: {n.note_body} <span className="text-[10px]">— {n.author}, {new Date(n.created_at).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openEdit(u)}><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openLinkDialog(u.id)}><Link2 className="w-3 h-3 mr-1" /> Link Tests</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setNoteDialog(u.id); setNoteForm({ title: "", body: "" }); }}><StickyNote className="w-3 h-3 mr-1" /> Add Note</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleDelete(u.id)}><Trash2 className="w-3 h-3 mr-1" /> Delete</Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">No updates logged yet.</div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={open => !open && setEditDialog(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{isNew ? "Log New Update" : "Edit Update"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title || ""} onChange={e => setForm((p: any) => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>Summary</Label><Textarea value={form.summary || ""} onChange={e => setForm((p: any) => ({ ...p, summary: e.target.value }))} rows={2} /></div>
            <div><Label>Detailed Description</Label><Textarea value={form.detailed_description || ""} onChange={e => setForm((p: any) => ({ ...p, detailed_description: e.target.value }))} rows={4} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Change Type</Label>
                <Select value={form.change_type || "feature"} onValueChange={v => setForm((p: any) => ({ ...p, change_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CHANGE_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status || "logged"} onValueChange={v => setForm((p: any) => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Affected Modules (comma-separated keys)</Label><Input value={(form.module_keys || []).join(", ")} onChange={e => setForm((p: any) => ({ ...p, module_keys: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) }))} /></div>
            <div><Label>Affected Roles (comma-separated)</Label><Input value={(form.affected_roles || []).join(", ")} onChange={e => setForm((p: any) => ({ ...p, affected_roles: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) }))} /></div>
            <div><Label>Version Tag</Label><Input value={form.version_tag || ""} onChange={e => setForm((p: any) => ({ ...p, version_tag: e.target.value }))} placeholder="1.0" /></div>
            <div><Label>Source Reference (optional)</Label><Input value={form.source_reference || ""} onChange={e => setForm((p: any) => ({ ...p, source_reference: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title}><Save className="w-4 h-4 mr-1" /> Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={!!noteDialog} onOpenChange={open => !open && setNoteDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Note</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={noteForm.title} onChange={e => setNoteForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>Body</Label><Textarea value={noteForm.body} onChange={e => setNoteForm(p => ({ ...p, body: e.target.value }))} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialog(null)}>Cancel</Button>
            <Button onClick={handleAddNote} disabled={!noteForm.title}><Plus className="w-4 h-4 mr-1" /> Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Test Cases Dialog */}
      <Dialog open={!!linkDialog} onOpenChange={open => !open && setLinkDialog(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Link Test Cases</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {testCases.map(tc => {
              const selected = selectedTestCases.find(s => s.id === tc.id);
              return (
                <div key={tc.id} className="flex items-center gap-2 p-2 border rounded text-sm">
                  <Checkbox checked={!!selected} onCheckedChange={() => toggleTestCase(tc.id)} />
                  <span className="flex-1 truncate">{tc.title}</span>
                  {selected && (
                    <Select value={selected.linkType} onValueChange={v => updateLinkType(tc.id, v)}>
                      <SelectTrigger className="h-6 w-[110px] text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{LINK_TYPES.map(l => <SelectItem key={l} value={l}>{l.replace("_", " ")}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialog(null)}>Cancel</Button>
            <Button onClick={handleSaveLinks}><Save className="w-4 h-4 mr-1" /> Save Links</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChangeLog;
