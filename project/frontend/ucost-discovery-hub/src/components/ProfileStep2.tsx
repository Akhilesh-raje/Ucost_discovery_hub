import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Baby, Users } from "lucide-react";
import { useCapacitor } from "@/hooks/useCapacitor";

interface ProfileStep2Props {
  onChildrenSelect: (hasChildren: boolean) => void;
  onBack: () => void;
  selectedGroup: string;
}

export function ProfileStep2({ onChildrenSelect, onBack, selectedGroup }: ProfileStep2Props) {
  const { isNative, triggerHaptic } = useCapacitor();

  // Skip this screen if Kids was already selected
  if (selectedGroup === "kids") {
    return null;
  }

  const handleChildrenSelect = async (hasChildren: boolean) => {
    if (isNative) {
      await triggerHaptic('light');
    }
    onChildrenSelect(hasChildren);
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
      </div>

      <div className="container mx-auto px-4 md:px-8 py-6 md:py-12 relative z-10 flex items-center justify-center min-h-screen">
        <div className="max-w-3xl w-full">
          {/* Header - Mobile optimized */}
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4">
              Does your group include children under 12?
            </h1>
            <p className="text-sm md:text-xl text-muted-foreground">
              This helps us recommend age-appropriate exhibits
            </p>
          </div>

          {/* Options - Mobile optimized */}
          <div className="grid grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
            <Card 
              className="bg-card/90 backdrop-blur-sm border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer group hover-lift"
              onClick={() => handleChildrenSelect(true)}
            >
              <CardContent className="p-4 md:p-8 text-center">
                <div className="mb-3 md:mb-6 flex justify-center">
                  <div className="p-3 md:p-6 rounded-full bg-kids/20 group-hover:bg-kids/30 transition-colors">
                    <Baby className="w-6 h-6 md:w-12 md:h-12 text-kids" />
                  </div>
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-foreground">Yes</h3>
              </CardContent>
            </Card>

            <Card 
              className="bg-card/90 backdrop-blur-sm border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer group hover-lift"
              onClick={() => handleChildrenSelect(false)}
            >
              <CardContent className="p-4 md:p-8 text-center">
                <div className="mb-3 md:mb-6 flex justify-center">
                  <div className="p-3 md:p-6 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
                    <Users className="w-6 h-6 md:w-12 md:h-12 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-foreground">No</h3>
              </CardContent>
            </Card>
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