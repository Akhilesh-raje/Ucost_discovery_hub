import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Timer, Hourglass, Calendar } from "lucide-react";
import { useCapacitor } from "@/hooks/useCapacitor";

interface ProfileStep4Props {
  onTimeSelect: (timeSlot: string) => void;
  onBack: () => void;
}

export function ProfileStep4({ onTimeSelect, onBack }: ProfileStep4Props) {
  const { isNative, triggerHaptic } = useCapacitor();

  const timeOptions = [
    {
      id: "quick",
      label: "15-30 minutes",
      icon: Timer,
      color: "kids"
    },
    {
      id: "medium",
      label: "30-60 minutes", 
      icon: Clock,
      color: "students"
    },
    {
      id: "long",
      label: "1-2 hours",
      icon: Hourglass,
      color: "families"
    },
    {
      id: "full",
      label: "Half-day or more",
      icon: Calendar,
      color: "researchers"
    }
  ];

  const handleTimeSelect = async (timeId: string) => {
    if (isNative) {
      await triggerHaptic('light');
    }
    onTimeSelect(timeId);
  };

  const handleBack = async () => {
    if (isNative) {
      await triggerHaptic('light');
    }
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-space relative overflow-hidden">
      {/* Animated Background Elements - Mobile optimized */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 w-12 h-12 md:w-20 md:h-20 bg-green-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-20 right-16 md:right-24 w-10 h-10 md:w-16 md:h-16 bg-pink-400 rounded-full animate-float-delayed opacity-70"></div>
        <div className="absolute bottom-32 left-16 md:left-32 w-8 h-8 md:w-12 md:h-12 bg-blue-400 rounded-full animate-float opacity-50"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-6 md:py-12 relative z-10 flex items-center justify-center min-h-screen">
        <div className="max-w-4xl w-full">
          {/* Header - Mobile optimized */}
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4">
              How much time do you have for your visit today?
            </h1>
            <p className="text-sm md:text-xl text-muted-foreground">
              This helps us create the perfect tour for you
            </p>
          </div>

          {/* Time Options - Mobile optimized 2x2 grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-8">
            {timeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Card 
                  key={option.id}
                  className="relative overflow-hidden bg-card/90 backdrop-blur-sm border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer group hover-lift"
                  onClick={() => handleTimeSelect(option.id)}
                >
                  <CardContent className="p-4 md:p-8 text-center">
                    <div className="mb-3 md:mb-6 flex justify-center">
                      <div className="p-3 md:p-6 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
                        <Icon className="w-6 h-6 md:w-12 md:h-12 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-sm md:text-2xl font-bold text-foreground">
                      {option.label}
                    </h3>
                  </CardContent>
                  
                  {/* Decorative elements - Mobile optimized */}
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 w-4 h-4 md:w-8 md:h-8 bg-accent/20 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 w-3 h-3 md:w-6 md:h-6 bg-primary/20 rounded-full animate-float"></div>
                </Card>
              );
            })}
          </div>

          {/* Back Button - Mobile optimized */}
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              size="lg"
              className="w-full md:w-auto px-6 py-3 md:px-8 md:py-4"
            >
              ← Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}