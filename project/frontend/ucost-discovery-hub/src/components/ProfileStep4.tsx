import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Timer, Hourglass, Calendar } from "lucide-react";

interface ProfileStep4Props {
  onTimeSelect: (timeSlot: string) => void;
  onBack: () => void;
}

export function ProfileStep4({ onTimeSelect, onBack }: ProfileStep4Props) {
  const timeOptions = [
    {
      id: "quick",
      label: "15-30 minutes",
      description: "Quick highlights tour",
      icon: Timer,
      color: "kids"
    },
    {
      id: "medium",
      label: "30-60 minutes", 
      description: "Focused exploration",
      icon: Clock,
      color: "students"
    },
    {
      id: "long",
      label: "1-2 hours",
      description: "Deep dive experience",
      icon: Hourglass,
      color: "families"
    },
    {
      id: "full",
      label: "Half-day or more",
      description: "Complete science adventure",
      icon: Calendar,
      color: "researchers"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-space relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 w-20 h-20 bg-green-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-20 right-24 w-16 h-16 bg-pink-400 rounded-full animate-float-delayed opacity-70"></div>
        <div className="absolute bottom-32 left-32 w-12 h-12 bg-blue-400 rounded-full animate-float opacity-50"></div>
      </div>

      <div className="container mx-auto px-8 py-12 relative z-10 flex items-center justify-center min-h-screen">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              How much time do you have for your visit today?
            </h1>
            <p className="text-xl text-muted-foreground">
              This helps us create the perfect tour for you
            </p>
          </div>

          {/* Time Options */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {timeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Card 
                  key={option.id}
                  className="relative overflow-hidden bg-card/90 backdrop-blur-sm border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer group hover-lift"
                  onClick={() => onTimeSelect(option.id)}
                >
                  <CardContent className="p-8 text-center">
                    <div className="mb-6 flex justify-center">
                      <div className="p-6 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
                        <Icon className="w-12 h-12 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {option.label}
                    </h3>
                    <p className="text-muted-foreground text-lg">
                      {option.description}
                    </p>
                  </CardContent>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-accent/20 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 bg-primary/20 rounded-full animate-float"></div>
                </Card>
              );
            })}
          </div>

          {/* Back Button */}
          <div className="text-center">
            <Button variant="outline" onClick={onBack} size="lg">
              ← Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}