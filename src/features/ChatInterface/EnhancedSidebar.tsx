
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, User, Settings, Sun, Moon, MapPin, Calendar, 
  TrendingUp, Award, Globe, Plane, X, ChevronLeft,
  BarChart3, Clock, Star, Heart
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { gsap } from 'gsap';
import { EditProfile } from './EditProfile';

interface EnhancedSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ isOpen, onToggle }) => {
  const { state } = useApp();
  const { user } = state;
  const [activeTab, setActiveTab] = useState<'chats' | 'profile' | 'settings'>('chats');
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo('.sidebar-content', 
        { x: -300, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [isOpen]);

  const userStats = {
    tripsCompleted: 12, // This would come from user's trip history
    countriesVisited: 8, // This would come from user's trip history
    totalDistance: '45,670 km', // This would be calculated from trips
    favoriteDestination: user?.preferences?.favoriteDestination || 'Not set',
    nextTrip: 'Thailand', // This would come from upcoming trips
    memberSince: '2024', // This would come from user creation date
    planningStreak: 15 // This would be calculated from user activity
  };

  const recentChats = [
    { id: '1', title: 'Trip to Dubai', preview: '4 people, ₹50,000 budget', time: '2 hours ago', status: 'active' },
    { id: '2', title: 'Europe Backpacking', preview: 'Solo trip, 2 weeks', time: '1 day ago', status: 'completed' },
    { id: '3', title: 'Family Vacation Goa', preview: '6 members, beach resort', time: '3 days ago', status: 'planning' },
  ];

  const renderProfile = () => (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <Avatar className="w-20 h-20 mx-auto mb-4 ring-2 ring-primary/20">
          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-lg">
            {user?.fullName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-lg">{user?.fullName || 'Travel Enthusiast'}</h3>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <Badge variant="outline">
            <Award className="w-3 h-3 mr-1" />
            Explorer Level
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowEditProfile(true)}
            className="text-xs"
          >
            <User className="w-3 h-3 mr-1" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="text-2xl font-bold text-primary">{userStats.tripsCompleted}</div>
          <div className="text-xs text-muted-foreground">Trips Completed</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-secondary/10 to-secondary/5">
          <div className="text-2xl font-bold text-secondary">{userStats.countriesVisited}</div>
          <div className="text-xs text-muted-foreground">Countries</div>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Plane className="w-4 h-4 text-primary" />
            <span className="text-sm">Total Distance</span>
          </div>
          <span className="font-semibold">{userStats.totalDistance}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-sm">Favorite Destination</span>
          </div>
          <span className="font-semibold">{userStats.favoriteDestination}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm">Planning Streak</span>
          </div>
          <span className="font-semibold">{userStats.planningStreak} days</span>
        </div>
      </div>

      <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-semibold">Next Adventure</span>
        </div>
        <p className="text-sm text-muted-foreground">Planning trip to {userStats.nextTrip}</p>
        <Button size="sm" className="mt-2 w-full" variant="outline">
          Continue Planning
        </Button>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="p-4 space-y-4">
      <div>
        <h4 className="font-semibold mb-3">Preferences</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm">Language</span>
            </div>
            <span className="text-sm">{user?.language || 'English'}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Plane className="w-4 h-4" />
              <span className="text-sm">Preferred Transport</span>
            </div>
            <span className="text-sm capitalize">{user?.preferredTravelMode || 'Any'}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-3">Notifications</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Trip Reminders</span>
            <Button size="sm" variant="outline">On</Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Price Alerts</span>
            <Button size="sm" variant="outline">On</Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Travel Tips</span>
            <Button size="sm" variant="outline">On</Button>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-3">Account</h4>
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => setShowEditProfile(true)}
          >
            <User className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-2" />
            Privacy Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );

  const renderChats = () => (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">Recent Chats</h4>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        {recentChats.map((chat) => (
          <Card key={chat.id} className="p-3 hover:bg-muted/50 cursor-pointer transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h5 className="font-medium text-sm truncate">{chat.title}</h5>
                <p className="text-xs text-muted-foreground mt-1 truncate">{chat.preview}</p>
                <p className="text-xs text-muted-foreground mt-1">{chat.time}</p>
              </div>
              <Badge 
                variant={chat.status === 'active' ? 'default' : 'secondary'}
                className="ml-2 text-xs"
              >
                {chat.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

            {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-card/80 backdrop-blur-md border-r border-border/50 z-50 transform transition-transform duration-300 sidebar-content flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                  {user?.fullName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">{user?.fullName || 'User'}</h3>
                <p className="text-xs text-muted-foreground">Travel Explorer</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggle}
              className="h-8 w-8 lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-shrink-0 flex border-b border-border/50">
          {[
            { id: 'chats', label: 'Chats', icon: Plus },
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === 'chats' && renderChats()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'settings' && renderSettings()}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-border/50">
          <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Trip
          </Button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfile
          onClose={() => setShowEditProfile(false)}
          onProfileUpdated={() => {
            // Profile was updated, you can add any additional logic here
            setShowEditProfile(false);
          }}
        />
      )}
    </>
  );
};
