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
      <Card className="w-full max-w-md border-0 shadow-[var(--shadow-peaceful)]">
        <CardContent className="pt-8 pb-8 text-center space-y-6 relative">
          <button
            onClick={onComplete}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            aria-label="Skip onboarding"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Step indicator */}
          <div className="flex justify-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-8 bg-primary" : "w-4 bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Icon className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="font-playfair text-2xl font-bold text-foreground">
              {current.title}
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {current.text}
            </p>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            {step < steps.length - 1 ? (
              <>
                <Button variant="ghost" size="sm" onClick={onComplete}>
                  Skip
                </Button>
                <Button variant="peaceful" onClick={() => setStep(step + 1)}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button variant="peaceful" size="lg" className="px-10" onClick={handleFinish}>
                Start Praying
                <Heart className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingGuide;
