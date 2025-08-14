import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Clock, 
  Star, 
  Users,
  Rocket,
  Atom,
  Bot,
  Leaf,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

interface SmartRoadmapProps {
  onStartTour: () => void;
  onCustomize: () => void;
  onBack: () => void;
  userProfile: {
    group: string;
    hasChildren: boolean;
    ageGroup: string;
    interests: string[];
    timeSlot: string;
  };
}

export function SmartRoadmap({ onStartTour, onCustomize, onBack, userProfile }: SmartRoadmapProps) {
  // Generate AI recommendations based on profile
  const generateRecommendations = () => {
    // TODO: Replace with real exhibits from database
    const baseExhibits: any[] = [];

    // Filter and sort based on profile
    let filtered = baseExhibits.filter(exhibit => exhibit.ageAppropriate);
    
    // Add more recommendations based on interests
    filtered = filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    });

    // Limit based on time
    const timeLimit = {
      quick: 2,
      medium: 3,
      long: 4,
      full: filtered.length
    };

    return filtered.slice(0, timeLimit[userProfile.timeSlot as keyof typeof timeLimit]);
  };

  const recommendations = generateRecommendations();
  const totalTime = recommendations.reduce((sum, exhibit) => sum + parseInt(exhibit.duration), 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-gray-500";
      default: return "bg-gray-500";
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
              Your Perfect Science Adventure
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              AI-curated tour based on your preferences
            </p>
            
            {/* Tour Summary */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="flex items-center gap-2 text-white">
                <Clock className="w-5 h-5" />
                <span>{totalTime} minutes total</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-5 h-5" />
                <span>{recommendations.length} exhibits</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5" />
                <span>Optimized for {userProfile.group}</span>
              </div>
            </div>
          </div>

          {/* Recommended Tour Path */}
          <div className="mb-12">
            <Card className="bg-card/90 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Star className="w-6 h-6 text-yellow-500" />
                  Recommended Tour Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">No Exhibits Available</h3>
                    <p className="text-muted-foreground">Please upload exhibits from the admin panel to generate tour recommendations.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {recommendations.map((exhibit, index) => {
                        const Icon = exhibit.icon;
                        const isLast = index === recommendations.length - 1;
                        
                        return (
                          <div key={exhibit.id} className="relative">
                            <div className="flex items-center gap-4">
                              {/* Step Number */}
                              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                                {index + 1}
                              </div>
                              
                              {/* Exhibit Info */}
                              <div className="flex-1 flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                                <div className="p-3 rounded-full bg-primary/20">
                                  <Icon className="w-6 h-6 text-primary" />
                                </div>
                                
                                <div className="flex-1">
                                  <h3 className="font-bold text-lg text-foreground">{exhibit.name}</h3>
                                  <p className="text-muted-foreground">{exhibit.description}</p>
                                </div>
                                
                                <div className="flex flex-col items-end gap-2">
                                  <Badge variant="secondary">{exhibit.zone}</Badge>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">{exhibit.duration}</span>
                                  </div>
                                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(exhibit.priority)}`}></div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Connecting Line */}
                            {!isLast && (
                              <div className="ml-4 mt-2 mb-2">
                                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Tour Progress</span>
                        <span className="text-sm text-muted-foreground">Ready to start</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Summary */}
          <div className="mb-8">
            <Card className="bg-card/90 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Group: {userProfile.group}</Badge>
                  <Badge variant="outline">Age: {userProfile.ageGroup}</Badge>
                  <Badge variant="outline">Time: {userProfile.timeSlot}</Badge>
                  {userProfile.hasChildren && <Badge variant="outline">With children</Badge>}
                  {userProfile.interests.map(interest => (
                    <Badge key={interest} variant="secondary">{interest}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={onBack} size="lg">
              ← Modify Profile
            </Button>
            <Button variant="secondary" onClick={onCustomize} size="lg">
              Customize Tour
            </Button>
            <Button onClick={onStartTour} size="lg" variant="cosmic">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Start My Tour
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}