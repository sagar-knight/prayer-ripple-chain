import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface FamilyGroupRow {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface FamilyMemberRow {
  id: string;
  family_group_id: string;
  user_id: string;
  role: string;
  status: string;
  display_name: string | null;
  joined_at: string;
}

export interface FamilyRequestRow {
  id: string;
  family_group_id: string;
  title: string;
  description: string | null;
  status: string;
  reminder_enabled: boolean;
  created_by: string;
  created_at: string;
}

export interface FamilyScriptureRow {
  id: string;
  family_group_id: string;
  verse_reference: string;
  translation: string;
  verse_text: string;
  note: string | null;
  shared_by: string;
  created_at: string;
}

export interface FamilyNoteRow {
  id: string;
  family_group_id: string;
  note_text: string;
  created_by: string;
  created_at: string;
}

export interface FamilyPrayerLogRow {
  id: string;
  request_id: string;
  user_id: string;
  prayed_at: string;
}

const generateInviteCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

export function useFamilyGroups() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["family-groups", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_groups")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as FamilyGroupRow[];
    },
    enabled: !!user,
  });
}

export function useFamilyMembers(familyGroupId: string | null) {
  return useQuery({
    queryKey: ["family-members", familyGroupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .eq("family_group_id", familyGroupId!)
        .order("joined_at", { ascending: true });
      if (error) throw error;
      return (data || []) as FamilyMemberRow[];
    },
    enabled: !!familyGroupId,
  });
}

export function useCreateFamilyGroup() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Must be logged in");
      const invite_code = generateInviteCode();
      const { data: group, error } = await supabase
        .from("family_groups")
        .insert({ name, invite_code, created_by: user.id })
        .select()
        .single();
      if (error) throw error;

      // Self-insert creator as active member (RLS allows role='member' for creator)
      const displayName = (user.user_metadata as any)?.display_name || "Family member";
      const { error: memberError } = await supabase.from("family_members").insert({
        family_group_id: group.id,
        user_id: user.id,
        role: "member",
        status: "active",
        display_name: displayName,
      });
      if (memberError) throw memberError;
      return group as FamilyGroupRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["family-groups"] });
    },
    onError: (e: any) => toast({ title: "Could not create family", description: e.message, variant: "destructive" }),
  });
}

export function useJoinFamilyByCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase.rpc("join_family_by_invite", { _invite_code: code });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["family-groups"] });
      qc.invalidateQueries({ queryKey: ["family-members"] });
    },
    onError: (e: any) => toast({ title: "Could not join", description: e.message, variant: "destructive" }),
  });
}

export function useFamilyRequests(familyGroupId: string | null) {
  return useQuery({
    queryKey: ["family-requests", familyGroupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_prayer_requests")
        .select("*")
        .eq("family_group_id", familyGroupId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as FamilyRequestRow[];
    },
    enabled: !!familyGroupId,
  });
}

export function useFamilyPrayerLogs(familyGroupId: string | null, requestIds: string[]) {
  return useQuery({
    queryKey: ["family-prayer-logs", familyGroupId, requestIds.sort().join(",")],
    queryFn: async () => {
      if (requestIds.length === 0) return [] as FamilyPrayerLogRow[];
      const { data, error } = await supabase
        .from("family_prayer_logs")
        .select("*")
        .in("request_id", requestIds);
      if (error) throw error;
      return (data || []) as FamilyPrayerLogRow[];
    },
    enabled: !!familyGroupId && requestIds.length > 0,
  });
}

export function useAddFamilyRequest(familyGroupId: string | null) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { title: string; description: string }) => {
      if (!user || !familyGroupId) throw new Error("Not ready");
      const { error } = await supabase.from("family_prayer_requests").insert({
        family_group_id: familyGroupId,
        title: input.title,
        description: input.description,
        created_by: user.id,
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family-requests", familyGroupId] }),
    onError: (e: any) => toast({ title: "Could not add request", description: e.message, variant: "destructive" }),
  });
}

export function useLogFamilyPrayer(familyGroupId: string | null) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("family_prayer_logs").insert({
        request_id: requestId,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["family-prayer-logs", familyGroupId] });
    },
    onError: (e: any) => toast({ title: "Could not record prayer", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateFamilyRequest(familyGroupId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FamilyRequestRow> }) => {
      const { error } = await supabase.from("family_prayer_requests").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family-requests", familyGroupId] }),
    onError: (e: any) => toast({ title: "Could not update", description: e.message, variant: "destructive" }),
  });
}

export function useFamilyScriptures(familyGroupId: string | null) {
  return useQuery({
    queryKey: ["family-scriptures", familyGroupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_scriptures")
        .select("*")
        .eq("family_group_id", familyGroupId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as FamilyScriptureRow[];
    },
    enabled: !!familyGroupId,
  });
}

export function useAddFamilyScripture(familyGroupId: string | null) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (s: { verse_reference: string; translation: string; verse_text: string; note: string }) => {
      if (!user || !familyGroupId) throw new Error("Not ready");
      const { error } = await supabase.from("family_scriptures").insert({
        family_group_id: familyGroupId,
        verse_reference: s.verse_reference,
        translation: s.translation,
        verse_text: s.verse_text,
        note: s.note || null,
        shared_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family-scriptures", familyGroupId] }),
    onError: (e: any) => toast({ title: "Could not share scripture", description: e.message, variant: "destructive" }),
  });
}

export function useFamilyNotes(familyGroupId: string | null) {
  return useQuery({
    queryKey: ["family-notes", familyGroupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_notes")
        .select("*")
        .eq("family_group_id", familyGroupId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as FamilyNoteRow[];
    },
    enabled: !!familyGroupId,
  });
}

export function useAddFamilyNote(familyGroupId: string | null) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (note_text: string) => {
      if (!user || !familyGroupId) throw new Error("Not ready");
      const { error } = await supabase.from("family_notes").insert({
        family_group_id: familyGroupId,
        note_text,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family-notes", familyGroupId] }),
    onError: (e: any) => toast({ title: "Could not add note", description: e.message, variant: "destructive" }),
  });
}