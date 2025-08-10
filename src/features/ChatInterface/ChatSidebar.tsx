
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, User, Settings, Sun, Moon, LogOut, Loader2, RefreshCw, MessageCircle, MapPin, Users, Calendar } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';

export const ChatSidebar = () => {
  const { state, dispatch, refreshUser, isAuthenticated } = useApp();
  const { user, isLoading, chatSessions } = state;
  const navigate = useNavigate();
  const [newChatTitle, setNewChatTitle] = useState('');
  const [showNewChatInput, setShowNewChatInput] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('ChatSidebar - User state:', user);
    console.log('ChatSidebar - Loading state:', isLoading);
    console.log('ChatSidebar - Is authenticated:', isAuthenticated());
    console.log('ChatSidebar - Chat sessions:', chatSessions);
  }, [user, isLoading, isAuthenticated, chatSessions]);

  // Create sample chat sessions for testing if none exist
  useEffect(() => {
    if (chatSessions.length === 0) {
      const sampleSessions = [
        {
          id: '1',
          title: 'Trip to Paris',
          lastMessage: 'Planning a romantic getaway to Paris',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          messageCount: 5,
          isActive: true
        },
        {
          id: '2',
          title: 'Dubai Adventure',
          lastMessage: 'Exploring desert and city life',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          messageCount: 8,
          isActive: false
        },
        {
          id: '3',
          title: 'Goa Beach Vacation',
          lastMessage: 'Family trip planning for summer',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          messageCount: 12,
          isActive: false
        }
      ];
      
      sampleSessions.forEach(session => {
        dispatch({ type: 'ADD_CHAT_SESSION', payload: session });
      });
    }
  }, [chatSessions.length, dispatch]);

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

  const handleNewChat = () => {
    if (newChatTitle.trim()) {
      const newSession = {
        id: Date.now().toString(),
        title: newChatTitle.trim(),
        lastMessage: 'New chat started',
        timestamp: new Date(),
        messageCount: 0,
        isActive: true
      };
      dispatch({ type: 'ADD_CHAT_SESSION', payload: newSession });
      dispatch({ type: 'SET_ACTIVE_CHAT', payload: newSession.id });
      setNewChatTitle('');
      setShowNewChatInput(false);
      navigate('/chat');
    }
  };

  const handleChatClick = (sessionId: string) => {
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: sessionId });
    navigate('/chat');
  };

  const updateChatSession = (sessionId: string, updates: any) => {
    dispatch({
      type: 'UPDATE_CHAT_SESSION',
      payload: {
        id: sessionId,
        updates
      }
    });
  };

  const createNewChatFromInput = (userInput: string) => {
    // Extract destination from user input
    const destinationMatch = userInput.match(/go to|visit|travel to|plan trip to|want to go to/i);
    let title = 'New Travel Chat';
    
    if (destinationMatch) {
      const afterKeyword = userInput.substring(userInput.indexOf(destinationMatch[0]) + destinationMatch[0].length).trim();
      const destination = afterKeyword.split(' ')[0]; // Get first word after keyword
      if (destination) {
        title = `Trip to ${destination.charAt(0).toUpperCase() + destination.slice(1)}`;
      }
    }

    const newSession = {
      id: Date.now().toString(),
      title: title,
      lastMessage: userInput.substring(0, 50) + (userInput.length > 50 ? '...' : ''),
      timestamp: new Date(),
      messageCount: 1,
      isActive: true
    };
    
    dispatch({ type: 'ADD_CHAT_SESSION', payload: newSession });
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: newSession.id });
    return newSession;
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
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
        
        {showNewChatInput ? (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter chat title..."
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNewChat()}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={handleNewChat}
                disabled={!newChatTitle.trim()}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowNewChatInput(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            className="w-full" 
            variant="outline" 
            disabled={isLoading}
            onClick={() => setShowNewChatInput(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        )}
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-muted-foreground">Recent Chats</h4>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => createNewChatFromInput('I want to go to Paris')}
              className="h-6 px-2 text-xs"
              title="Test: Create Paris trip"
            >
              Test
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="h-6 w-6 p-0"
              title="Refresh chats"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          {chatSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs">Start a new conversation to begin planning your trip</p>
            </div>
          ) : (
            chatSessions.map((session) => (
              <Button
                key={session.id}
                variant={session.isActive ? "default" : "ghost"}
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => handleChatClick(session.id)}
              >
                <div className="w-full text-left">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm truncate">{session.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(session.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-2">
                    {session.lastMessage}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {session.messageCount} messages
                    </span>
                    {session.tripId && (
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        Trip linked
                      </span>
                    )}
                  </div>
                  {/* Show trip details if available */}
                  {session.title.includes('Trip to') && (
                    <div className="mt-2 p-2 bg-muted/30 rounded-md">
                      <p className="text-xs font-medium text-primary">
                        {session.title.replace('Trip to ', '')} Trip
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.lastMessage}
                      </p>
                    </div>
                  )}
                </div>
              </Button>
            ))
          )}
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
