import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, UserRound, Clock3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { resolveAvatarUrl, clearAvatarCache } from "@/lib/avatar";

interface Props {
  userId: string;
  displayName?: string;
}

type Status = "none" | "pending" | "approved" | "rejected";

const AvatarUploader = ({ userId, displayName }: Props) => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<Status>("none");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url, pending_avatar_url, avatar_status, avatar_rejection_reason")
      .eq("id", userId)
      .maybeSingle();
    const st = (data?.avatar_status as Status) || "none";
    setStatus(st);
    setRejectionReason(data?.avatar_rejection_reason ?? null);
    const toShow = data?.pending_avatar_url ?? data?.avatar_url ?? null;
    setPreviewUrl(await resolveAvatarUrl(toShow));
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please choose an image file", variant: "destructive" });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 4MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;

      const { error: dbErr } = await supabase
        .from("profiles")
        .update({
          pending_avatar_url: path,
          avatar_status: "pending",
          avatar_rejection_reason: null,
        })
        .eq("id", userId);
      if (dbErr) throw dbErr;

      clearAvatarCache(path);
      toast({
        title: "Submitted for review",
        description: "Your new photo will appear after a moderator approves it.",
      });
      await refresh();
    } catch (e) {
      toast({
        title: "Upload failed",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const initials =
    (displayName || "")
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-20 w-20">
          {previewUrl && <AvatarImage src={previewUrl} alt="Profile photo" />}
          <AvatarFallback className="bg-muted">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : initials || <UserRound className="h-6 w-6" />}
          </AvatarFallback>
        </Avatar>
        {status === "pending" && (
          <span className="absolute -bottom-1 -right-1 rounded-full bg-background border p-1">
            <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-foreground">Profile photo</p>
          {status === "pending" && (
            <Badge variant="secondary" className="text-[10px]">Pending review</Badge>
          )}
          {status === "rejected" && (
            <Badge variant="destructive" className="text-[10px]">Rejected</Badge>
          )}
          {status === "approved" && (
            <Badge className="text-[10px]">Approved</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Photos are reviewed before they appear publicly. JPG or PNG, up to 4MB.
        </p>
        {status === "rejected" && rejectionReason && (
          <p className="text-xs text-destructive">Reason: {rejectionReason}</p>
        )}
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading || status === "pending"}
            onClick={() => fileRef.current?.click()}
            className="gap-2"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {status === "pending"
              ? "Awaiting review"
              : previewUrl
                ? "Replace photo"
                : "Upload photo"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AvatarUploader;
