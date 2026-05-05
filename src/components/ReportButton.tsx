import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { reportSchema, checkRateLimit } from "@/lib/validation";

interface ReportButtonProps {
  entityId: string;
  entityType:
    | "global_prayer"
    | "church_prayer"
    | "family_prayer"
    | "family_note"
    | "family_scripture";
  className?: string;
}

const ReportButton = ({ entityId, entityType, className }: ReportButtonProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!reason) return;

    const parsed = reportSchema.safeParse({ reason, details });
    if (!parsed.success) {
      toast({ title: "Please check your input", variant: "destructive" });
      return;
    }

    const rl = checkRateLimit("report", 5, 300_000); // 5 reports per 5 min
    if (!rl.allowed) {
      toast({ title: "Please wait before reporting again", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      if (!user) {
        toast({ title: "Please sign in to report content", variant: "destructive" });
        return;
      }
      const { error } = await supabase.rpc("submit_content_report", {
        _entity_type: entityType,
        _entity_id: entityId,
        _reason: parsed.data.reason,
        _details: parsed.data.details ?? null,
      });
      if (error) throw error;
      toast({ title: "Thank you for reporting", description: "Our moderators will review this content." });
      setOpen(false);
      setReason("");
      setDetails("");
    } catch (err) {
      console.error("Report submission failed", err);
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`text-muted-foreground/50 hover:text-destructive gap-1 text-xs ${className}`}
        >
          <Flag className="h-3 w-3" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-playfair">Report Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="abuse">Abuse / Harassment</SelectItem>
                <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Additional details (optional)</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Tell us more..."
              maxLength={500}
              className="min-h-[80px]"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!reason || submitting}
            className="w-full"
            variant="destructive"
          >
            {submitting ? "Submitting…" : "Submit Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportButton;
