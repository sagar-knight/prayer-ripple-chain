import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRequestToJoinCommunity } from "@/hooks/useCommunity";

const MAX_LEN = 300;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: string;
  communityName: string;
}

export default function RequestJoinCommunityDialog({
  open,
  onOpenChange,
  communityId,
  communityName,
}: Props) {
  const [message, setMessage] = useState("");
  const request = useRequestToJoinCommunity();

  const handleSubmit = async () => {
    try {
      await request.mutateAsync({ communityId, message: message.trim() || undefined });
      setMessage("");
      onOpenChange(false);
    } catch {
      /* toast handled in hook */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playfair">Join Community</DialogTitle>
          <DialogDescription>
            You're requesting to join <span className="font-medium text-foreground">{communityName}</span>.
            A community leader will review your request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="join-message" className="text-sm">
            Optional message
          </Label>
          <Textarea
            id="join-message"
            placeholder="Tell the community leader why you'd like to join."
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_LEN))}
            rows={4}
          />
          <p className="text-xs text-muted-foreground text-right">
            {message.length} / {MAX_LEN}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={request.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={request.isPending}>
            {request.isPending ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}