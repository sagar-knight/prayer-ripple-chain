import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ArrowRight, Waves, X } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const steps = [
  {
    icon: Heart,
    title: "Pray for Someone",
    text: "Each day you can pray for someone who needs encouragement.",
  },
  {
    icon: ArrowRight,
    title: "Pass Prayer Forward",
    text: "After praying, share the prayer so more people can join.",
  },
  {
    icon: Waves,
    title: "Watch the Ripple",
    text: "Your prayers create a ripple of encouragement.",
  },
];

export function useOnboardingStatus() {
  const [completed, setCompleted] = useLocalStorage("onboarding_completed", false);
  return { completed, setCompleted };
}

const OnboardingGuide = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const current = steps[step];
  const Icon = current.icon;

  const handleFinish = () => {
    onComplete();
    navigate("/pray");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-border shadow-warm">
        <CardContent className="pt-10 pb-10 text-center space-y-7 relative">
          <button
            onClick={onComplete}
            className="absolute top-5 right-5 text-muted-foreground hover:text-foreground"
            aria-label="Skip onboarding"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Step indicator */}
          <div className="flex justify-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === step ? "w-10 bg-primary" : "w-5 bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Icon className="h-10 w-10 text-primary" />
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-3xl font-bold text-foreground">
              {current.title}
            </h2>
            <p className="text-muted-foreground text-lg max-w-sm mx-auto">
              {current.text}
            </p>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            {step < steps.length - 1 ? (
              <>
                <Button variant="ghost" size="default" onClick={onComplete}>
                  Skip
                </Button>
                <Button onClick={() => setStep(step + 1)} className="rounded-full px-8">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button size="lg" className="px-10 rounded-full" onClick={handleFinish}>
                Start Praying
                <Heart className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingGuide;
