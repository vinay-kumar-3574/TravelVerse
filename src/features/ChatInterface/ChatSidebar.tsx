
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, User, Settings, Sun, Moon, LogOut, Loader2, RefreshCw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';

export const ChatSidebar = () => {
  const { state, dispatch, refreshUser, isAuthenticated } = useApp();
  const { user, isLoading } = state;
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('ChatSidebar - User state:', user);
    console.log('ChatSidebar - Loading state:', isLoading);
    console.log('ChatSidebar - Is authenticated:', isAuthenticated());
  }, [user, isLoading, isAuthenticated]);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRefreshProfile = () => {
    refreshUser();
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* User Profile */}
      <div className="flex-shrink-0 p-6 border-b border-border">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="w-12 h-12">
            {user?.profileImage ? (
              <AvatarImage src={user.profileImage} alt={user.fullName} />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.fullName ? getInitials(user.fullName) : <User className="w-6 h-6" />}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading profile...</span>
              </div>
            ) : user ? (
              <>
                <h3 className="font-semibold">{user.fullName || 'User'}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.contact && (
                  <p className="text-xs text-muted-foreground">{user.contact}</p>
                )}
                <p className="text-xs text-muted-foreground">ID: {user.id}</p>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-muted-foreground">Not Logged In</h3>
                <p className="text-sm text-muted-foreground">Please log in to continue</p>
              </>
            )}
          </div>
          {user && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefreshProfile}
              disabled={isLoading}
              className="h-8 w-8"
              title="Refresh Profile"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
        
        <Button className="w-full" variant="outline" disabled={isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Recent Chats</h4>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start text-left">
            <div>
              <p className="font-medium">Trip to Dubai</p>
              <p className="text-sm text-muted-foreground">4 people, ₹50,000 budget</p>
            </div>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-border space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>
        {user && (
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        )}
        {!user && (
          <Button 
            variant="ghost" 
            className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => navigate('/auth')}
          >
            <User className="w-4 h-4 mr-3" />
            Login
          </Button>
        )}
      </div>
    </div>
  );
};
