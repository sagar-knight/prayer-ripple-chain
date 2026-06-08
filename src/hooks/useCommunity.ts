import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";
import { slugify } from "@/lib/slugify";

export interface Church {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
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
        .from("churches_public")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // communities_public view excludes private contact fields by design
      return (data || []) as unknown as Church[];
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
      description?: string;
      logo_url?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      // Generate unique slug
      const baseSlug = slugify(church.name);
      const slug = baseSlug + "-" + Math.random().toString(36).slice(2, 8);

      // Create community profile
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

      // Add creator as community admin
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
      toast({ title: "Community registered", description: "Your community has been created successfully." });
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
      toast({ title: "Joined", description: "You are now a member of this community." });
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
      toast({ title: "Request submitted", description: "Your prayer request was sent to a community admin for approval." });
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

// ===================== Community Join Requests =====================

export interface CommunityJoinRequest {
  id: string;
  community_id: string;
  user_id: string;
  message: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reviewed_at: string | null;
  reviewed_by: string | null;
  reviewed_note: string | null;
  created_at: string;
  updated_at: string;
}

// Current user's request for a given community (most recent)
export function useMyCommunityJoinRequest(communityId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["community-join-request", "me", communityId, user?.id],
    enabled: !!communityId && !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("community_join_requests")
        .select("*")
        .eq("community_id", communityId)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as CommunityJoinRequest | null) ?? null;
    },
  });
}

// All requests for a community (admin/moderator view)
export function useCommunityJoinRequests(communityId: string, statusFilter?: string) {
  return useQuery({
    queryKey: ["community-join-requests", communityId, statusFilter],
    enabled: !!communityId,
    queryFn: async () => {
      let q = (supabase as any)
        .from("community_join_requests")
        .select("*")
        .eq("community_id", communityId)
        .order("created_at", { ascending: false });
      if (statusFilter) q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as CommunityJoinRequest[];
    },
  });
}

export function useRequestToJoinCommunity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (args: { communityId: string; message?: string }) => {
      if (!user) throw new Error("Must be signed in");
      const { data, error } = await (supabase as any).rpc("request_to_join_community", {
        _community_id: args.communityId,
        _message: args.message ?? null,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["community-join-request", "me", vars.communityId] });
      queryClient.invalidateQueries({ queryKey: ["community-join-requests", vars.communityId] });
      toast({
        title: "Request sent",
        description: "Your request has been sent to the community leader.",
      });
    },
    onError: (err: any) => {
      toast({ title: "Could not send request", description: err.message, variant: "destructive" });
    },
  });
}

export function useReviewCommunityJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      requestId: string;
      communityId: string;
      decision: "approved" | "rejected";
      note?: string;
    }) => {
      const { error } = await (supabase as any).rpc("review_community_join_request", {
        _request_id: args.requestId,
        _decision: args.decision,
        _note: args.note ?? null,
      });
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["community-join-requests", vars.communityId] });
      queryClient.invalidateQueries({ queryKey: ["church-members", vars.communityId] });
      toast({
        title: vars.decision === "approved" ? "Member approved" : "Request rejected",
        description: vars.decision === "approved"
          ? "They've been added to your community."
          : "The request has been declined.",
      });
    },
    onError: (err: any) => {
      toast({ title: "Could not update request", description: err.message, variant: "destructive" });
    },
  });
}

export function useCancelCommunityJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { requestId: string; communityId: string }) => {
      const { error } = await (supabase as any).rpc("cancel_community_join_request", {
        _request_id: args.requestId,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["community-join-request", "me", vars.communityId] });
      queryClient.invalidateQueries({ queryKey: ["my-pending-community-requests"] });
      toast({ title: "Request cancelled", description: "You can request to join again anytime." });
    },
    onError: (err: any) => {
      toast({ title: "Could not cancel", description: err.message, variant: "destructive" });
    },
  });
}

export function useLeaveCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (communityId: string) => {
      const { error } = await (supabase as any).rpc("leave_community", {
        _community_id: communityId,
      });
      if (error) throw error;
    },
    onSuccess: (_d, communityId) => {
      queryClient.invalidateQueries({ queryKey: ["church-membership", communityId] });
      queryClient.invalidateQueries({ queryKey: ["church-members", communityId] });
      queryClient.invalidateQueries({ queryKey: ["my-churches"] });
      queryClient.invalidateQueries({ queryKey: ["my-memberships-map"] });
      toast({ title: "You have left the community", description: "You can rejoin anytime by sending a new request." });
    },
    onError: (err: any) => {
      toast({ title: "Could not leave community", description: err.message, variant: "destructive" });
    },
  });
}
