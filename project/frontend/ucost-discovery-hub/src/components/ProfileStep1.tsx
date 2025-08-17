import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, Heart, FlaskConical } from "lucide-react";
import { useCapacitor } from "@/hooks/useCapacitor";

interface ProfileStep1Props {
  onGroupSelect: (group: string) => void;
  onBack: () => void;
}

export function ProfileStep1({ onGroupSelect, onBack }: ProfileStep1Props) {
  const { isNative, triggerHaptic } = useCapacitor();

  const groups = [
    {
      id: "kids",
      label: "Kids",
      icon: Heart,
      color: "kids"
    },
    {
      id: "students", 
      label: "Students",
      icon: GraduationCap,
      color: "students"
    },
    {
      id: "families",
      label: "Families", 
      icon: Users,
      color: "families"
    },
    {
      id: "researchers",
      label: "Researchers",
      icon: FlaskConical,
      color: "researchers"
    }
  ];

  const handleGroupSelect = async (groupId: string) => {
    if (isNative) {
      await triggerHaptic('light');
    }
    onGroupSelect(groupId);
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
        <div className="absolute top-16 left-16 w-12 h-12 md:w-20 md:h-20 bg-blue-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-20 right-16 md:right-24 w-10 h-10 md:w-16 md:h-16 bg-orange-400 rounded-full animate-float-delayed opacity-70"></div>
        <div className="absolute bottom-32 left-16 md:left-32 w-8 h-8 md:w-12 md:h-12 bg-purple-400 rounded-full animate-float opacity-50"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-6 md:py-12 relative z-10 flex items-center justify-center min-h-screen">
        <div className="max-w-4xl w-full">
          {/* Header - Mobile optimized */}
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4">
              Which group best describes you?
            </h1>
            <p className="text-sm md:text-xl text-muted-foreground">
              This helps us personalize your science adventure
            </p>
          </div>

          {/* Group Selection - Mobile optimized 2x2 grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-8">
            {groups.map((group) => {
              const Icon = group.icon;
              return (
                <Card 
                  key={group.id}
                  className="relative overflow-hidden bg-card/90 backdrop-blur-sm border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer group hover-lift"
                  onClick={() => handleGroupSelect(group.id)}
                >
                  <CardContent className="p-4 md:p-8 text-center">
                    <div className="mb-3 md:mb-6 flex justify-center">
                      <div className="p-3 md:p-6 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
                        <Icon className="w-6 h-6 md:w-12 md:h-12 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-sm md:text-2xl font-bold text-foreground">
                      {group.label}
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
              ← Back to Welcome
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}