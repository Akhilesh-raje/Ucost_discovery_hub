import React, { useState, useEffect } from 'react';
import { useCapacitor } from '../hooks/useCapacitor';
import { MobileLayout, MobileCard, MobileButton, MobileInput } from '../components/ui/mobile-layout';
import { MobileNavigation, MobileBreadcrumb } from '../components/ui/mobile-navigation';
import { 
  MapPin, 
  Calendar, 
  Tag, 
  Image, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  RefreshCw, 
  Star, 
  Users, 
  Clock,
  Globe,
  Camera,
  Settings,
  ArrowRight,
  BarChart3
} from 'lucide-react';

interface Exhibit {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  imageUrl?: string;
  status: 'active' | 'inactive' | 'maintenance';
  visitors: number;
  rating: number;
  lastUpdated: string;
  tags: string[];
}

const mockExhibits: Exhibit[] = [
  {
    id: '1',
    name: 'Ancient Egyptian Artifacts',
    description: 'Collection of artifacts from ancient Egypt including mummies, jewelry, and tools',
    category: 'Archaeology',
    location: 'Ground Floor, Gallery A',
    status: 'active',
    visitors: 1247,
    rating: 4.8,
    lastUpdated: '2 hours ago',
    tags: ['Egypt', 'Ancient', 'Artifacts', 'Mummies']
  },
  {
    id: '2',
    name: 'Renaissance Paintings',
    description: 'Masterpieces from the Renaissance period by famous artists',
    category: 'Fine Art',
    location: 'First Floor, Gallery B',
    status: 'active',
    visitors: 892,
    rating: 4.9,
    lastUpdated: '1 day ago',
    tags: ['Renaissance', 'Paintings', 'Art', 'History']
  },
  {
    id: '3',
    name: 'Modern Sculptures',
    description: 'Contemporary sculpture collection from modern artists',
    category: 'Modern Art',
    location: 'Outdoor Garden',
    status: 'maintenance',
    visitors: 456,
    rating: 4.6,
    lastUpdated: '3 days ago',
    tags: ['Modern', 'Sculpture', 'Contemporary', 'Outdoor']
  }
];

export const MobileExhibitManagement: React.FC = () => {
  const { isNative, triggerHaptic, platform } = useCapacitor();
  const [activeTab, setActiveTab] = useState<'overview' | 'add' | 'edit' | 'analytics'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const handleTabChange = async (tab: typeof activeTab) => {
    if (isNative) {
      await triggerHaptic('light');
    }
    setActiveTab(tab);
  };

  const handleExhibitAction = async (action: string, exhibit: Exhibit) => {
    if (isNative) {
      await triggerHaptic('medium');
    }
    console.log(`${action} exhibit:`, exhibit.id);
  };

  const getStatusColor = (status: Exhibit['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'maintenance': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: Exhibit['status']) => {
    switch (status) {
      case 'active': return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'inactive': return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
      case 'maintenance': return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      default: return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  const categories = ['all', 'Archaeology', 'Fine Art', 'Modern Art', 'Science', 'History'];

  return (
    <MobileLayout>
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Main Content with Safe Area Spacing */}
      <div className="pt-20 pb-20">
        {/* Breadcrumb */}
        <MobileBreadcrumb 
          items={[
            { label: 'Admin', path: '/admin' },
            { label: 'Exhibits' }
          ]} 
        />

        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Exhibit Management</h1>
              <p className="text-muted-foreground">Manage and monitor all exhibits</p>
            </div>
            <MobileButton
              onClick={() => setActiveTab('add')}
              className="h-10"
            >
              <Plus className="mr-2" size={18} />
              Add Exhibit
            </MobileButton>
          </div>

          {/* Search and Filter Bar */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <MobileInput
                placeholder="Search exhibits by name, category, or location..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="pl-10"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: <Eye size={18} /> },
              { id: 'add', label: 'Add New', icon: <Plus size={18} /> },
              { id: 'edit', label: 'Edit', icon: <Edit size={18} /> },
              { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <MobileCard className="text-center p-4">
                <MapPin className="mx-auto mb-2 text-blue-500" size={24} />
                <div className="text-2xl font-bold">{mockExhibits.length}</div>
                <div className="text-xs text-muted-foreground">Total Exhibits</div>
              </MobileCard>
              <MobileCard className="text-center p-4">
                <Users className="mx-auto mb-2 text-green-500" size={24} />
                <div className="text-2xl font-bold">
                  {mockExhibits.reduce((sum, exhibit) => sum + exhibit.visitors, 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Visitors</div>
              </MobileCard>
            </div>

            {/* Exhibit List */}
            <div className="space-y-3">
              {mockExhibits.map((exhibit) => (
                <MobileCard
                  key={exhibit.id}
                  className="p-4"
                  interactive
                  onClick={() => setSelectedExhibit(exhibit)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Exhibit Image Placeholder */}
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      {exhibit.imageUrl ? (
                        <img src={exhibit.imageUrl} alt={exhibit.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Image className="text-muted-foreground" size={24} />
                      )}
                    </div>
                    
                    {/* Exhibit Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{exhibit.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{exhibit.description}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          {getStatusIcon(exhibit.status)}
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(exhibit.status)}`}>
                            {exhibit.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Exhibit Details */}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center">
                          <MapPin size={12} className="mr-1" />
                          {exhibit.location}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Tag size={12} className="mr-1" />
                          {exhibit.category}
                        </span>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Users size={12} className="mr-1" />
                          {exhibit.visitors.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Star size={12} className="mr-1" />
                          {exhibit.rating}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock size={12} className="mr-1" />
                          {exhibit.lastUpdated}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t">
                    <MobileButton
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExhibitAction('view', exhibit);
                      }}
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </MobileButton>
                    <MobileButton
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExhibitAction('edit', exhibit);
                      }}
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </MobileButton>
                    <MobileButton
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExhibitAction('delete', exhibit);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </MobileButton>
                  </div>
                </MobileCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="space-y-6">
            <h3 className="font-semibold">Add New Exhibit</h3>
            
            <MobileCard className="p-4">
              <div className="space-y-4">
                {/* Basic Information */}
                <div>
                  <label className="block text-sm font-medium mb-2">Exhibit Name</label>
                  <MobileInput placeholder="Enter exhibit name" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea 
                    className="w-full p-3 border rounded-md resize-none"
                    rows={3}
                    placeholder="Enter exhibit description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select className="w-full p-3 border rounded-md">
                      <option>Archaeology</option>
                      <option>Fine Art</option>
                      <option>Modern Art</option>
                      <option>Science</option>
                      <option>History</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <MobileInput placeholder="Gallery location" />
                  </div>
                </div>
                
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Exhibit Image</label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Camera className="mx-auto mb-2 text-muted-foreground" size={24} />
                    <p className="text-sm text-muted-foreground">Click to upload image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                </div>
                
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <MobileInput placeholder="Enter tags separated by commas" />
                </div>
                
                {/* Submit Button */}
                <MobileButton className="w-full h-12">
                  <Plus className="mr-2" size={18} />
                  Create Exhibit
                </MobileButton>
              </div>
            </MobileCard>
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="space-y-4">
            <h3 className="font-semibold">Edit Exhibits</h3>
            <p className="text-muted-foreground">Select an exhibit from the overview to edit</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <h3 className="font-semibold">Exhibit Analytics</h3>
            
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <MobileCard className="text-center p-4">
                <div className="text-2xl font-bold text-green-600">+12.5%</div>
                <div className="text-xs text-muted-foreground">Visitor Growth</div>
              </MobileCard>
              <MobileCard className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600">4.8</div>
                <div className="text-xs text-muted-foreground">Avg Rating</div>
              </MobileCard>
            </div>
            
            {/* Popular Exhibits */}
            <MobileCard className="p-4">
              <h4 className="font-medium mb-3">Most Popular Exhibits</h4>
              <div className="space-y-2">
                {mockExhibits
                  .sort((a, b) => b.visitors - a.visitors)
                  .slice(0, 3)
                  .map((exhibit, index) => (
                    <div key={exhibit.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <span className="text-sm">{exhibit.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{exhibit.visitors.toLocaleString()} visitors</span>
                    </div>
                  ))}
              </div>
            </MobileCard>
          </div>
        )}
      </div>

      {/* Exhibit Detail Modal */}
      {selectedExhibit && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Exhibit Details</h3>
              <MobileButton
                variant="ghost"
                size="icon"
                onClick={() => setSelectedExhibit(null)}
                className="h-8 w-8"
              >
                ×
              </MobileButton>
            </div>
            
            <div className="space-y-4">
              {/* Exhibit Image */}
              <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                {selectedExhibit.imageUrl ? (
                  <img src={selectedExhibit.imageUrl} alt={selectedExhibit.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Image className="text-muted-foreground" size={48} />
                )}
              </div>
              
              {/* Exhibit Info */}
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <p className="font-medium">{selectedExhibit.name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Description:</span>
                  <p className="text-sm">{selectedExhibit.description}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <p className="font-medium">{selectedExhibit.category}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <p className="font-medium">{selectedExhibit.location}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(selectedExhibit.status)}`}>
                    {selectedExhibit.status}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedExhibit.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-muted rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4 border-t">
                <MobileButton
                  variant="outline"
                  onClick={() => {
                    handleExhibitAction('edit', selectedExhibit);
                    setSelectedExhibit(null);
                  }}
                  className="flex-1"
                >
                  <Edit className="mr-2" size={16} />
                  Edit Exhibit
                </MobileButton>
                <MobileButton
                  variant="destructive"
                  onClick={() => {
                    handleExhibitAction('delete', selectedExhibit);
                    setSelectedExhibit(null);
                  }}
                  className="flex-1"
                >
                  <Trash2 className="mr-2" size={16} />
                  Delete
                </MobileButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}; 