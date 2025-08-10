
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, User, Settings, Sun, Moon } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const ChatSidebar = () => {
  const { state } = useApp();
  const { user } = state;

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* User Profile */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback>
              <User className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{user?.fullName || 'User'}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        
        <Button className="w-full" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4">
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
      <div className="p-4 border-t border-border space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>
      </div>
    </div>
  );
};
