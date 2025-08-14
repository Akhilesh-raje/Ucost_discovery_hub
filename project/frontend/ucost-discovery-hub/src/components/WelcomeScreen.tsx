import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, GraduationCap, Heart, FlaskConical, Rocket, Sparkles, Settings } from "lucide-react";
interface WelcomeScreenProps {
  onStartJourney: () => void;
  onAdminAccess: () => void;
}
export function WelcomeScreen({
  onStartJourney,
  onAdminAccess
}: WelcomeScreenProps) {
  return <div className="min-h-screen bg-gradient-space relative overflow-hidden">
      {/* Admin Access Button */}
      <Button variant="ghost" size="icon" onClick={onAdminAccess} className="absolute top-4 right-4 opacity-30 hover:opacity-100 transition-opacity z-20">
        <Settings className="h-5 w-5" />
      </Button>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Planets */}
        <div className="absolute top-16 left-16 w-20 h-20 bg-blue-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-20 right-24 w-16 h-16 bg-orange-400 rounded-full animate-float-delayed opacity-70"></div>
        <div className="absolute bottom-32 left-32 w-12 h-12 bg-purple-400 rounded-full animate-float opacity-50"></div>
        <div className="absolute bottom-24 right-32 w-24 h-24 bg-green-400 rounded-full animate-float-delayed opacity-60"></div>
        
        {/* Stars */}
        <Sparkles className="absolute top-32 left-1/3 w-6 h-6 text-yellow-300 animate-pulse" />
        <Sparkles className="absolute top-48 right-1/3 w-4 h-4 text-blue-300 animate-pulse" style={{
        animationDelay: '1s'
      }} />
        <Sparkles className="absolute bottom-48 left-1/4 w-5 h-5 text-purple-300 animate-pulse" style={{
        animationDelay: '2s'
      }} />
        
        {/* Rocket */}
        <Rocket className="absolute top-60 right-16 w-8 h-8 text-orange-400 animate-bounce-gentle" />
      </div>

      <div className="container mx-auto px-8 py-12 relative z-10 flex items-center justify-center min-h-screen">
        <div className="max-w-6xl w-full">
          {/* Robot Mascot & Header */}
          <div className="flex items-center justify-center gap-8 mb-16">
            {/* Robot Character */}
            <div className="relative">
              <div className="w-32 h-32 bg-blue-400 rounded-full flex items-center justify-center border-8 border-blue-300 animate-bounce-gentle">
                <div className="flex gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                  <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-blue-300 rounded-full"></div>
            </div>
            
            {/* Title */}
            <div className="text-center">
              <h1 className="text-6xl font-bold text-white mb-4">
                Welcome to UCOST
              </h1>
              
              <p className="text-2xl text-muted-foreground mb-8">
                Your personalized science adventure awaits
              </p>
            </div>
          </div>

          {/* Main Action Button */}
          <div className="text-center mb-16">
            <Button onClick={onStartJourney} size="xl" variant="cosmic" className="text-2xl px-16 py-8 rounded-3xl">
              <Sparkles className="w-8 h-8 mr-4" />
              Start Your Adventure
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-card/90 backdrop-blur-sm border-border">
              <div className="p-6 text-center">
                <Rocket className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Personalized Tours</h3>
                <p className="text-muted-foreground">AI-powered recommendations based on your interests</p>
              </div>
            </Card>
            
            <Card className="bg-card/90 backdrop-blur-sm border-border">
              <div className="p-6 text-center">
                <FlaskConical className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Interactive Exhibits</h3>
                <p className="text-muted-foreground">Hands-on science experiences for all ages</p>
              </div>
            </Card>
            
            <Card className="bg-card/90 backdrop-blur-sm border-border">
              <div className="p-6 text-center">
                <Heart className="w-12 h-12 text-kids mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Family Friendly</h3>
                <p className="text-muted-foreground">Fun for kids, students, families, and researchers</p>
              </div>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center mt-16">
            <p className="text-xl text-muted-foreground font-medium">
              🚀 Powered by AI • UCOST Dehradun
            </p>
          </div>
        </div>
      </div>
    </div>;
}