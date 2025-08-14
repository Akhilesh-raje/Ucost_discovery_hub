import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, Heart, FlaskConical } from "lucide-react";

interface ProfileStep1Props {
  onGroupSelect: (group: string) => void;
  onBack: () => void;
}

export function ProfileStep1({ onGroupSelect, onBack }: ProfileStep1Props) {
  const groups = [
    {
      id: "kids",
      label: "Kids",
      icon: Heart,
      description: "Fun discoveries for young explorers",
      color: "kids"
    },
    {
      id: "students", 
      label: "Students",
      icon: GraduationCap,
      description: "Learning adventures for curious minds",
      color: "students"
    },
    {
      id: "families",
      label: "Families", 
      icon: Users,
      description: "Explore together, learn together",
      color: "families"
    },
    {
      id: "researchers",
      label: "Researchers",
      icon: FlaskConical,
      description: "Deep scientific exploration",
      color: "researchers"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-space relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 w-20 h-20 bg-blue-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-20 right-24 w-16 h-16 bg-orange-400 rounded-full animate-float-delayed opacity-70"></div>
        <div className="absolute bottom-32 left-32 w-12 h-12 bg-purple-400 rounded-full animate-float opacity-50"></div>
      </div>

      <div className="container mx-auto px-8 py-12 relative z-10 flex items-center justify-center min-h-screen">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Which group best describes you?
            </h1>
            <p className="text-xl text-muted-foreground">
              This helps us personalize your science adventure
            </p>
          </div>

          {/* Group Selection */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {groups.map((group) => {
              const Icon = group.icon;
              return (
                <Card 
                  key={group.id}
                  className="relative overflow-hidden bg-card/90 backdrop-blur-sm border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer group hover-lift"
                  onClick={() => onGroupSelect(group.id)}
                >
                  <CardContent className="p-8 text-center">
                    <div className="mb-6 flex justify-center">
                      <div className="p-6 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
                        <Icon className="w-12 h-12 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {group.label}
                    </h3>
                    <p className="text-muted-foreground text-lg">
                      {group.description}
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
              ← Back to Welcome
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}