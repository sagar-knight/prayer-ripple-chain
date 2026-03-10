import { useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Download, ExternalLink, QrCode } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChurchInviteToolsProps {
  churchId: string;
  churchSlug: string | null;
  churchName: string;
  userId?: string;
}

const ChurchInviteTools = ({ churchId, churchSlug, churchName, userId }: ChurchInviteToolsProps) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const joinUrl = churchSlug
    ? `${window.location.origin}/join/${churchSlug}`
    : `${window.location.origin}/churches/${churchId}`;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(joinUrl);
    toast({ title: "Link copied!", description: "Share it with your church community." });
  }, [joinUrl]);

  const handleDownloadQR = useCallback(async () => {
    const svgEl = qrRef.current?.querySelector("svg");
    if (!svgEl) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 512;
    canvas.width = size;
    canvas.height = size + 60;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, size, size);

      // Add church name below
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(churchName, size / 2, size + 36);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${churchName.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      });

      URL.revokeObjectURL(url);
    };
    img.src = url;

    // Track
    await supabase.from("app_events").insert({
      event_type: "church_qr_downloaded",
      entity_type: "church",
      entity_id: churchId,
      actor_user_id: userId || null,
    });

    toast({ title: "QR Code downloaded", description: "Print it for your bulletins or slides." });
  }, [churchId, churchName, userId]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-playfair text-lg flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          Church Invite Tools
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Share this link or QR code with your church so members can join instantly.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Join link */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Church Join Link</label>
          <div className="flex gap-2">
            <Input value={joinUrl} readOnly className="text-sm bg-muted/50" />
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Link2 className="h-4 w-4 mr-1" />Copy
            </Button>
          </div>
        </div>

        {/* QR code */}
        <div className="flex flex-col items-center gap-4">
          <div
            ref={qrRef}
            className="p-4 bg-white rounded-xl border border-border shadow-sm"
          >
            <QRCodeSVG
              value={joinUrl}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            <Button variant="outline" size="sm" onClick={handleDownloadQR}>
              <Download className="h-4 w-4 mr-1" />Download QR
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={joinUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />Open Join Page
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChurchInviteTools;
