import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCapacitor } from '../hooks/useCapacitor';
import { MobileNavigation } from '../components/ui/mobile-navigation';
import {
  DisplayLarge,
  HeadlineMedium,
  TitleLarge,
  BodyMedium,
  CaptionMedium,
  PrimaryButton,
  SecondaryButton,
  IconButton,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  FeatureCard,
  StatsCard,
  SearchInput,
  FloatingActionButton
} from '../components/mobile-ui';
import {
  Search,
  Map,
  Users,
  Settings,
  Bell,
  Star,
  TrendingUp,
  Activity,
  Plus,
  ArrowRight,
  Rocket,
  Beaker,
  Heart,
  Camera,
  Globe,
  Clock,
  Award
} from 'lucide-react';

interface Exhibit {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  imageUrl?: string;
  rating: number;
  visitors: number;
}

const mockExhibits: Exhibit[] = [
  {
    id: '1',
    name: 'Ancient Egyptian Artifacts',
    description: 'Discover the mysteries of ancient Egypt through authentic artifacts and interactive displays',
    category: 'Archaeology',
    location: 'Ground Floor, Gallery A',
    rating: 4.8,
    visitors: 1247
  },
  {
    id: '2',
    name: 'Renaissance Masterpieces',
    description: 'Experience the artistic brilliance of the Renaissance period with original paintings and sculptures',
    category: 'Fine Art',
    location: 'First Floor, Gallery B',
    rating: 4.9,
    visitors: 892
  },
  {
    id: '3',
    name: 'Modern Innovation Hub',
    description: 'Explore cutting-edge technology and scientific breakthroughs in our interactive innovation center',
    category: 'Science & Technology',
    location: 'Second Floor, Innovation Wing',
    rating: 4.7,
    visitors: 756
  }
];

export const MobileHomeRedesigned: React.FC = () => {
  const navigate = useNavigate();
  const { isNative, triggerHaptic, platform } = useCapacitor();
  const [searchQuery, setSearchQuery] = useState('');
  const [exhibits, setExhibits] = useState<Exhibit[]>(mockExhibits);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const handleSearch = async (query: string) => {
    if (isNative) {
      await triggerHaptic('light');
    }
    
    if (query.trim()) {
      const filtered = mockExhibits.filter(exhibit =>
        exhibit.name.toLowerCase().includes(query.toLowerCase()) ||
        exhibit.description.toLowerCase().includes(query.toLowerCase()) ||
        exhibit.category.toLowerCase().includes(query.toLowerCase())
      );
      setExhibits(filtered);
    } else {
      setExhibits(mockExhibits);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (isNative) {
      await triggerHaptic('light');
    }
    
    switch (action) {
      case 'admin':
        navigate('/admin');
        break;
      case 'exhibits':
        navigate('/admin/exhibits');
        break;
      case 'notifications':
        console.log('Open notifications');
        break;
      case 'settings':
        console.log('Open settings');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Main Content with Safe Area Spacing */}
      <div className="pt-20 pb-20 px-4">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <DisplayLarge className="mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to UCOST
          </DisplayLarge>
          <BodyMedium className="text-muted-foreground mb-6 max-w-md mx-auto">
            Your personalized science adventure awaits. Discover amazing exhibits and explore our world-class museum.
          </BodyMedium>
          {isNative && (
            <CaptionMedium className="text-primary mb-4">
              📱 Running on {platform}
            </CaptionMedium>
          )}
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <SearchInput
            placeholder="Search exhibits, categories, or locations..."
            onSearch={handleSearch}
            size="lg"
            fullWidth
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <HeadlineMedium className="mb-4">Quick Actions</HeadlineMedium>
          <div className="grid grid-cols-2 gap-4">
            <FeatureCard
              icon={<Settings className="h-6 w-6" />}
              title="Admin Panel"
              description="Manage your system"
              onClick={() => handleQuickAction('admin')}
            />
            <FeatureCard
              icon={<Map className="h-6 w-6" />}
              title="Manage Exhibits"
              description="Control your content"
              onClick={() => handleQuickAction('exhibits')}
            />
            <FeatureCard
              icon={<Bell className="h-6 w-6" />}
              title="Notifications"
              description="Stay updated"
              onClick={() => handleQuickAction('notifications')}
            />
            <FeatureCard
              icon={<Settings className="h-6 w-6" />}
              title="Settings"
              description="Customize your experience"
              onClick={() => handleQuickAction('settings')}
            />
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mb-8">
          <HeadlineMedium className="mb-4">Today's Overview</HeadlineMedium>
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              icon={<TrendingUp className="h-5 w-5" />}
              value="1,247"
              label="Total Visitors"
              trend={{ value: "+12.5%", isPositive: true }}
            />
            <StatsCard
              icon={<Activity className="h-5 w-5" />}
              value="89"
              label="Active Tours"
              trend={{ value: "+8.2%", isPositive: true }}
            />
          </div>
        </div>

        {/* Featured Exhibits */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <HeadlineMedium>Featured Exhibits</HeadlineMedium>
            <SecondaryButton size="sm" variant="ghost">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </SecondaryButton>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-32 bg-muted rounded-lg"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {exhibits.map((exhibit) => (
                <Card key={exhibit.id} className="overflow-hidden" interactive>
                  <div className="flex">
                    {/* Exhibit Image */}
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="h-8 w-8 text-blue-600" />
                    </div>
                    
                    {/* Exhibit Info */}
                    <div className="flex-1 ml-4 min-w-0">
                      <CardHeader padding="none">
                        <CardTitle className="text-base mb-1">{exhibit.name}</CardTitle>
                        <CardDescription className="text-xs line-clamp-2 mb-2">
                          {exhibit.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary font-medium">
                            {exhibit.category}
                          </span>
                          <span className="inline-flex items-center text-xs text-muted-foreground">
                            <Map className="mr-1 h-3 w-3" />
                            {exhibit.location}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center text-xs text-muted-foreground">
                            <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {exhibit.rating}
                          </span>
                          <span className="flex items-center text-xs text-muted-foreground">
                            <Users className="mr-1 h-3 w-3" />
                            {exhibit.visitors.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <HeadlineMedium className="mb-4">Recent Activity</HeadlineMedium>
          <Card>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <BodyMedium>New exhibit "Modern Innovation Hub" added</BodyMedium>
                    <CaptionMedium className="text-muted-foreground">2 hours ago</CaptionMedium>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <BodyMedium>Tour group "Renaissance Art" started</BodyMedium>
                    <CaptionMedium className="text-muted-foreground">4 hours ago</CaptionMedium>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <BodyMedium>Maintenance scheduled for Gallery A</BodyMedium>
                    <CaptionMedium className="text-muted-foreground">1 day ago</CaptionMedium>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="py-8">
              <Rocket className="h-12 w-12 mx-auto mb-4 text-white" />
              <HeadlineMedium className="text-white mb-2">
                Ready to Explore?
              </HeadlineMedium>
              <BodyMedium className="text-blue-100 mb-6">
                Start your personalized journey through science and discovery
              </BodyMedium>
              <PrimaryButton
                size="lg"
                variant="secondary"
                onClick={() => handleQuickAction('exhibits')}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Start Your Adventure
                <ArrowRight className="ml-2 h-5 w-5" />
              </PrimaryButton>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => handleQuickAction('admin')}
        leftIcon={<Plus className="h-6 w-6" />}
        className="bg-primary text-primary-foreground shadow-2xl"
      >
        Admin
      </FloatingActionButton>
    </div>
  );
}; 