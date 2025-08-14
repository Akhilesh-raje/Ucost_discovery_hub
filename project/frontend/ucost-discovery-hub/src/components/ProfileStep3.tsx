import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Atom, 
  Bot, 
  Leaf, 
  Dna, 
  Zap, 
  Globe, 
  Microscope,
  Mountain,
  Star
} from "lucide-react";

interface ProfileStep3Props {
  onAgeAndInterestsSelect: (ageGroup: string, interests: string[]) => void;
  onBack: () => void;
}

export function ProfileStep3({ onAgeAndInterestsSelect, onBack }: ProfileStep3Props) {
  const [selectedAge, setSelectedAge] = useState<string>("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const ageGroups = [
    { id: "under-10", label: "Under 10", color: "kids" },
    { id: "10-18", label: "10-18", color: "students" },
    { id: "18-25", label: "18-25", color: "primary" },
    { id: "25-40", label: "25-40", color: "families" },
    { id: "40-plus", label: "40+", color: "researchers" }
  ];

  const interests = [
    { id: "space", label: "Space & Astronomy", icon: Rocket, color: "blue" },
    { id: "physics", label: "Physics", icon: Atom, color: "purple" },
    { id: "robotics", label: "AI & Robotics", icon: Bot, color: "orange" },
    { id: "environment", label: "Environment", icon: Leaf, color: "green" },
    { id: "biology", label: "Biology", icon: Dna, color: "pink" },
    { id: "energy", label: "Energy", icon: Zap, color: "yellow" },
    { id: "earth", label: "Earth Sciences", icon: Globe, color: "cyan" },
    { id: "chemistry", label: "Chemistry", icon: Microscope, color: "red" },
    { id: "geology", label: "Geology", icon: Mountain, color: "brown" },
    { id: "astronomy", label: "Stars & Planets", icon: Star, color: "indigo" }
  ];

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleNext = () => {
    if (selectedAge) {
      onAgeAndInterestsSelect(selectedAge, selectedInterests);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-space relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 w-20 h-20 bg-blue-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-20 right-24 w-16 h-16 bg-orange-400 rounded-full animate-float-delayed opacity-70"></div>
        <div className="absolute bottom-32 left-32 w-12 h-12 bg-purple-400 rounded-full animate-float opacity-50"></div>
      </div>

      <div className="container mx-auto px-8 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Tell us more about your interests
            </h1>
            <p className="text-xl text-muted-foreground">
              Select your age group and areas of interest
            </p>
          </div>

          {/* Age Group Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Age Group</h2>
            <div className="flex justify-center gap-4 flex-wrap">
              {ageGroups.map((age) => (
                <Button
                  key={age.id}
                  variant={selectedAge === age.id ? "default" : "outline"}
                  size="lg"
                  onClick={() => setSelectedAge(age.id)}
                  className={`${selectedAge === age.id ? 'ring-2 ring-primary' : ''}`}
                >
                  {age.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Interests Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Areas of Interest (optional)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {interests.map((interest) => {
                const Icon = interest.icon;
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <Card
                    key={interest.id}
                    className={`cursor-pointer transition-all duration-300 hover-lift ${
                      isSelected 
                        ? 'bg-primary/20 border-primary ring-2 ring-primary' 
                        : 'bg-card/90 backdrop-blur-sm border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleInterest(interest.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="mb-3 flex justify-center">
                        <Icon className={`w-8 h-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <p className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {interest.label}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Selected Interests Display */}
          {selectedInterests.length > 0 && (
            <div className="mb-8 text-center">
              <p className="text-white mb-4">Selected interests:</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {selectedInterests.map((interestId) => {
                  const interest = interests.find(i => i.id === interestId);
                  return (
                    <Badge key={interestId} variant="secondary" className="text-sm">
                      {interest?.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={onBack} size="lg">
              ← Back
            </Button>
            <Button 
              onClick={handleNext} 
              size="lg"
              disabled={!selectedAge}
              variant="cosmic"
            >
              Continue →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}