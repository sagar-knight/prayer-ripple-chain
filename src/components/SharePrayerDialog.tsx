import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, MessageCircle, Mail, Smartphone, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  buildEmailHref,
  buildShortPrayerUrl,
  buildSmsHref,
  buildWhatsAppHref,
  copyToClipboard,
  getPrayerSlug,
} from "@/lib/prayerShare";

interface SharePrayerDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  prayerId: string;
  prayerTitle?: string;
}

const SharePrayerDialog = ({ open, onOpenChange, prayerId, prayerTitle }: SharePrayerDialogProps) => {
  const { toast } = useToast();
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !prayerId) return;
    let active = true;
    setLoading(true);
    getPrayerSlug(prayerId)
      .then((s) => active && setSlug(s))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [open, prayerId]);

  const url = slug ? buildShortPrayerUrl(slug) : "";
  const shareOpts = { url, title: prayerTitle };

  const handleCopy = async () => {
    if (!url) return;
    const ok = await copyToClipboard(url);
    toast({
      title: ok ? "Link copied" : "Copy failed",
      description: ok ? url : "Please copy the link manually.",
      variant: ok ? "default" : "destructive",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playfair flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            Share this prayer request
          </DialogTitle>
          <DialogDescription>
            Invite friends, family, or your church to pray with you.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center gap-2 py-6 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing your link...
          </div>
        ) : !slug ? (
          <p className="text-sm text-muted-foreground py-4">
            This prayer request can't be shared right now.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input value={url} readOnly className="text-xs" />
              <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy link">
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild className="gap-2">
                <a href={buildWhatsAppHref(shareOpts)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <a href={buildSmsHref(shareOpts)}>
                  <Smartphone className="h-4 w-4" />
                  SMS
                </a>
              </Button>
              <Button variant="outline" asChild className="gap-2 col-span-2">
                <a href={buildEmailHref(shareOpts)}>
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Anyone with this link can read and pray. No personal account info is shared.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SharePrayerDialog;