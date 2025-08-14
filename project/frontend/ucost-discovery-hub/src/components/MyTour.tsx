import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, Play, Check, MapPin, Rocket, Brain, Leaf, Mountain } from "lucide-react";

interface MyTourProps {
  selectedExhibits: string[];
  onBack: () => void;
  onStartTour: () => void;
  onRemoveExhibit: (exhibitId: string) => void;
}

export function MyTour({ selectedExhibits, onBack, onStartTour, onRemoveExhibit }: MyTourProps) {
  const exhibitData = {
    "space-mission": { name: "Space Mission", icon: Rocket, color: "bg-blue-500" },
    "artificial-intelligence": { name: "Artificial Intelligence", icon: Brain, color: "bg-purple-500" },
    "climate-change": { name: "Climate Change", icon: Leaf, color: "bg-green-500" },
    "dinosaurs": { name: "Dinosaurs", icon: Mountain, color: "bg-orange-500" }
  };

  return (
    <div className="min-h-screen bg-gradient-space relative overflow-hidden">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="absolute top-4 left-4 z-20 text-white hover:bg-white/10"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Home Button */}
      <Button
        variant="ghost"
        onClick={() => window.location.reload()}
        className="absolute top-4 right-4 z-20 text-white hover:bg-white/10"
      >
        <Home className="mr-2 h-4 w-4" />
        Home
      </Button>

      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 w-20 h-20 bg-orange-400 rounded-full animate-float opacity-30"></div>
        <div className="absolute top-32 right-24 w-16 h-16 bg-blue-400 rounded-full animate-float-delayed opacity-25"></div>
        <div className="absolute bottom-24 left-24 w-24 h-24 bg-purple-400 rounded-full animate-float opacity-35"></div>
        <div className="absolute bottom-32 right-32 w-18 h-18 bg-green-400 rounded-full animate-float-delayed opacity-30"></div>
      </div>

      <div className="container mx-auto px-8 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            MY TOUR
          </h1>
          <p className="text-xl text-blue-200">
            Your personalized science adventure awaits!
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tour List */}
          <div>
            <Card className="bg-white/95 backdrop-blur-sm border-0 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Check className="w-6 h-6 text-green-500" />
                Selected Exhibits
              </h2>
              
              {selectedExhibits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 text-lg mb-4">No exhibits selected yet</p>
                  <Button
                    onClick={onBack}
                    variant="outline"
                    className="text-gray-800 border-gray-300"
                  >
                    Go Back to Add Exhibits
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedExhibits.map((exhibitId, index) => {
                    const exhibit = exhibitData[exhibitId as keyof typeof exhibitData];
                    if (!exhibit) return null;
                    
                    const Icon = exhibit.icon;
                    return (
                      <div key={exhibitId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                        <div className={`w-12 h-12 ${exhibit.color} rounded-full flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{exhibit.name}</h3>
                          <p className="text-sm text-gray-600">Stop #{index + 1}</p>
                        </div>
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Map Preview */}
          <div>
            <Card className="bg-white/95 backdrop-blur-sm border-0 rounded-3xl p-8 shadow-2xl h-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-red-500" />
                Your Route
              </h2>
              
              {/* Mini Map */}
              <div className="relative bg-gradient-to-br from-blue-400 via-green-400 to-blue-500 rounded-2xl h-64 overflow-hidden">
                {/* Map background */}
                <div className="absolute inset-0">
                  <div className="absolute top-4 left-4 w-16 h-12 bg-green-500 rounded-lg opacity-80"></div>
                  <div className="absolute bottom-4 right-4 w-20 h-14 bg-green-600 rounded-lg opacity-80"></div>
                  <div className="absolute top-8 right-8 w-12 h-10 bg-green-400 rounded-lg opacity-70"></div>
                </div>
                
                {/* Route Path */}
                {selectedExhibits.length > 1 && (
                  <svg className="absolute inset-0 w-full h-full">
                    <path
                      d="M 50 50 Q 150 100 200 150 T 250 200"
                      stroke="white"
                      strokeWidth="4"
                      strokeDasharray="10,5"
                      fill="none"
                      className="animate-pulse"
                    />
                  </svg>
                )}
                
                {/* Start Point */}
                <div className="absolute top-8 left-8 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                
                {/* End Point */}
                {selectedExhibits.length > 0 && (
                  <div className="absolute bottom-8 right-8 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              {/* Start Button */}
              {selectedExhibits.length > 0 && (
                <div className="mt-8">
                  <Button
                    onClick={onStartTour}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    size="xl"
                  >
                    <Play className="mr-3 h-6 w-6" />
                    START TOUR
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}