import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";
import { slugify } from "@/lib/slugify";

export interface Church {
  id: string;
  name: string;
  slug: string | null;
  denomination: string | null;
  city: string | null;
  state: string | null;
  country: string;
  address: string | null;
  website: string | null;
  phone: string | null;
  contact_email: string;
  logo_url: string | null;
  privacy: string;
  status: string;
  verified: boolean;
  created_by: string;
  created_at: string;
}

export interface ChurchMembership {
  id: string;
  church_id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
}

export interface ChurchPrayerRequest {
  id: string;
  church_id: string;
  submitted_by: string;
  title: string;
  description: string;
  category: string;
  anonymous: boolean;
  show_country: boolean;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  created_at: string;
  updated_at: string;
}

export function useChurches() {
  return useQuery({
    queryKey: ["churches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("churches")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Church[];
    },
  });
}

export function useChurch(id: string) {
  return useQuery({
    queryKey: ["church", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("churches")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Church;
    },
    enabled: !!id,
  });
}

export function useChurchMembership(churchId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["church-membership", churchId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("church_memberships")
        .select("*")
        .eq("church_id", churchId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as ChurchMembership | null;
    },
    enabled: !!churchId && !!user,
  });
}

export function useChurchMembers(churchId: string) {
  return useQuery({
    queryKey: ["church-members", churchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("church_memberships")
        .select("*")
        .eq("church_id", churchId)
        .eq("status", "active");
      if (error) throw error;
      return data as ChurchMembership[];
    },
    enabled: !!churchId,
  });
}

export function useChurchPrayerRequests(churchId: string, statusFilter?: string) {
  return useQuery({
    queryKey: ["church-prayer-requests", churchId, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("church_prayer_requests")
        .select("*")
        .eq("church_id", churchId)
        .order("created_at", { ascending: false });
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as ChurchPrayerRequest[];
    },
    enabled: !!churchId,
  });
}

export function useCreateChurch() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (church: {
      name: string;
      denomination?: string;
      city?: string;
      state?: string;
      country: string;
      address?: string;
      website?: string;
      phone?: string;
      contact_email: string;
      privacy: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      // Generate unique slug
      const baseSlug = slugify(church.name);
      const slug = baseSlug + "-" + Math.random().toString(36).slice(2, 8);

      // Create church
      const { data: churchData, error: churchError } = await supabase
        .from("churches")
        .insert({
          ...church,
          slug,
          created_by: user.id,
        })
        .select()
        .single();
      if (churchError) throw churchError;

      // Add creator as admin
      const { error: memberError } = await supabase
        .from("church_memberships")
        .insert({
          church_id: churchData.id,
          user_id: user.id,
          role: "admin",
          status: "active",
        });
      if (memberError) throw memberError;

      return churchData as Church;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["churches"] });
      toast({ title: "Church registered", description: "Your church has been created successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useJoinChurch() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (churchId: string) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("church_memberships").insert({
        church_id: churchId,
        user_id: user.id,
        role: "member",
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: (_, churchId) => {
      queryClient.invalidateQueries({ queryKey: ["church-membership", churchId] });
      queryClient.invalidateQueries({ queryKey: ["church-members", churchId] });
      toast({ title: "Joined!", description: "You are now a member of this church." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useSubmitChurchPrayer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (request: {
      church_id: string;
      title: string;
      description: string;
      category: string;
      anonymous?: boolean;
    }) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("church_prayer_requests").insert({
        ...request,
        submitted_by: user.id,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["church-prayer-requests", vars.church_id] });
      toast({ title: "Request submitted", description: "Your prayer request was sent to the church admin for approval." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useModerateRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ requestId, action, reason, churchId }: {
      requestId: string;
      action: "approved" | "rejected";
      reason?: string;
      churchId: string;
    }) => {
      if (!user) throw new Error("Must be logged in");
      const updates: any = { status: action };
      if (action === "approved") {
        updates.approved_by = user.id;
        updates.approved_at = new Date().toISOString();
      }
      if (action === "rejected" && reason) {
        updates.rejected_reason = reason;
      }
      const { error } = await supabase
        .from("church_prayer_requests")
        .update(updates)
        .eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["church-prayer-requests", vars.churchId] });
      toast({
        title: vars.action === "approved" ? "Request approved" : "Request rejected",
        description: vars.action === "approved"
          ? "The prayer request is now visible on the Prayer Wall."
          : "The submitter will be notified.",
      });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
