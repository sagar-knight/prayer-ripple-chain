import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Flame, Shield, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const levels = [
  {
    value: "open",
    label: "Open Heart",
    icon: Heart,
    description: "Pray when you feel called — no pressure, no schedule.",
    color: "text-muted-foreground",
  },
  {
    value: "dedicated",
    label: "Dedicated Partner",
    icon: Flame,
    description: "Commit to praying daily for at least one request.",
    color: "text-primary",
  },
  {
    value: "warrior",
    label: "Prayer Warrior",
    icon: Shield,
    description: "Actively seek requests, set reminders, and pass prayers forward.",
    color: "text-primary",
  },
] as const;

const CommitmentLevelSelector = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: currentLevel } = useQuery({
    queryKey: ["commitment_level", user?.id],
    queryFn: async () => {
      if (!user) return "open";
      const { data } = await supabase
        .from("profiles")
        .select("commitment_level")
        .eq("id", user.id)
        .maybeSingle();
      return (data as any)?.commitment_level || "open";
    },
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: async (level: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ commitment_level: level } as any)
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: (_, level) => {
      queryClient.invalidateQueries({ queryKey: ["commitment_level"] });
      const label = levels.find((l) => l.value === level)?.label;
      toast.success(`Commitment set to ${label}`);
    },
    onError: () => toast.error("Could not update commitment level"),
  });

  return (
    <Card className="animate-gentle-fade">
      <CardHeader>
        <CardTitle className="font-playfair flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          Prayer Commitment Level
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Choose how you'd like to engage as a prayer partner. You can change this anytime.
        </p>
        <div className="space-y-2">
          {levels.map((level) => {
            const Icon = level.icon;
            const isSelected = currentLevel === level.value;
            return (
              <button
                key={level.value}
                onClick={() => mutation.mutate(level.value)}
                disabled={mutation.isPending}
                className={`w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-muted/50"
                }`}
              >
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${isSelected ? "text-primary" : level.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{level.label}</span>
                    {isSelected && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{level.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommitmentLevelSelector;
