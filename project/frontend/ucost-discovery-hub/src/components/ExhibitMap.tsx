import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Rocket, Brain, Leaf, Mountain, FlaskConical, Telescope, MapPin } from "lucide-react";

// Import the actual map images
import outsideMap from './maps/outside.png';
import groundMap from './maps/ground.png';
import firstFloorMap from './maps/1st-floor.png';

interface ExhibitMapProps {
  userProfile: { group: string; interests: string[] } | null;
  onExhibitSelect: (exhibitId: string) => void;
  onBack: () => void;
}

export function ExhibitMap({ userProfile, onExhibitSelect, onBack }: ExhibitMapProps) {
  const [selectedFloor, setSelectedFloor] = useState<'outside' | 'ground' | 'first'>('ground');
  
  // TODO: Replace with real exhibits from database
  const exhibits: any[] = [];

  const floorOptions = [
    { value: 'outside', label: 'Outside Area', map: outsideMap },
    { value: 'ground', label: 'Ground Floor', map: groundMap },
    { value: 'first', label: '1st Floor', map: firstFloorMap },
  ];

  const currentMap = floorOptions.find(f => f.value === selectedFloor)?.map || groundMap;

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

      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Planets in background */}
        <div className="absolute top-32 left-8 w-24 h-24 bg-orange-400 rounded-full animate-float opacity-30"></div>
        <div className="absolute top-16 right-16 w-32 h-32 bg-blue-400 rounded-full animate-float-delayed opacity-25"></div>
        <div className="absolute bottom-24 left-24 w-20 h-20 bg-purple-400 rounded-full animate-float opacity-35"></div>
        <div className="absolute bottom-32 right-32 w-28 h-28 bg-green-400 rounded-full animate-float-delayed opacity-30"></div>
        
        {/* Stars */}
        <div className="absolute top-20 left-1/3 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute top-48 right-1/4 w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-48 left-1/2 w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-8 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            TAP AN EXHIBIT TO EXPLORE
          </h1>
          <p className="text-xl text-blue-200">
            {userProfile ? `Perfect for ${userProfile.group}! Choose your next adventure` : 'Choose your next adventure'}
          </p>
        </div>

        {/* Floor Selector */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-2">
            {floorOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedFloor === option.value ? "default" : "ghost"}
                onClick={() => setSelectedFloor(option.value as any)}
                className="text-white hover:bg-white/20"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Interactive Map */}
        <div className="relative mx-auto max-w-6xl h-96 rounded-3xl overflow-hidden">
          {/* Map Background - Actual floor map */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <img
              src={currentMap}
              alt={`${selectedFloor} floor map`}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Exhibit Locations */}
          {exhibits.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-white/50 p-8">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Exhibits Yet</h3>
                  <p className="text-gray-600">Upload exhibits from the admin panel to see them here!</p>
                </div>
              </Card>
            </div>
          ) : (
            exhibits.map((exhibit) => {
              const Icon = exhibit.icon;
              return (
                <Card
                  key={exhibit.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover-lift group bg-white/95 backdrop-blur-sm border-2 border-white/50 hover:border-primary transition-all duration-300`}
                  style={exhibit.position}
                  onClick={() => onExhibitSelect(exhibit.id)}
                >
                  <div className="p-4 text-center">
                    <div className={`w-16 h-16 ${exhibit.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:animate-bounce-gentle`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm mb-1">{exhibit.name}</h3>
                    <p className="text-xs text-gray-600">{exhibit.description}</p>
                  </div>
                  
                  {/* Location Pin */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <MapPin className="w-4 h-4 text-red-500" />
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Instructions */}
        <div className="text-center mt-12">
          <Card className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-4">
            <p className="text-white text-lg font-medium">
              👆 Tap any exhibit icon to learn more and add it to your tour!
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}