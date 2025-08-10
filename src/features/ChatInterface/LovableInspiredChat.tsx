
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, Plus, User, Bot, Menu, Settings, Plane, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { aiService } from '@/api/aiService';
import { MessageAnimation, FloatingTravelIcons, PlaneAnimation } from '@/components/animations/GSAPAnimations';
import { EnhancedSidebar } from './EnhancedSidebar';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  data?: any;
}

export const LovableInspiredChat = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "✈️ Welcome to TravelVerse AI! I'm your intelligent travel companion. Tell me about your dream destination, budget, and travel preferences - let's plan something amazing together!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Parse the travel prompt
      const parsedData = await aiService.parseTravelPrompt(inputValue);
      
      // If we have valid travel data, create a trip
      if (parsedData.source && parsedData.destination) {
        const newTrip = {
          id: Date.now().toString(),
          source: parsedData.source,
          destination: parsedData.destination,
          budget: parsedData.budget || 50000,
          members: parsedData.members || 1,
          departureDate: '',
          returnDate: '',
          status: 'planning' as const
        };
        dispatch({ type: 'SET_CURRENT_TRIP', payload: newTrip });

        // Show trip analysis message
        const analysisMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'system',
          content: `🎯 **Trip Analysis**\n📍 **From:** ${parsedData.source}\n🏖️ **To:** ${parsedData.destination}\n💰 **Budget:** ₹${parsedData.budget?.toLocaleString()}\n👥 **Travelers:** ${parsedData.members}`,
          timestamp: new Date(),
          data: parsedData
        };
        setMessages(prev => [...prev, analysisMessage]);

        // Generate AI response
        const aiResponse = await aiService.chatResponse(inputValue, parsedData);
        const aiMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: aiResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);

        // Show action buttons
        setTimeout(() => {
          const actionMessage: Message = {
            id: (Date.now() + 3).toString(),
            type: 'system',
            content: 'Ready to explore your travel options?',
            timestamp: new Date(),
            data: { action: 'show_transport', trip: newTrip }
          };
          setMessages(prev => [...prev, actionMessage]);
        }, 1000);

      } else {
        // Regular chat response
        const aiResponse = await aiService.chatResponse(inputValue);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: aiResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '😅 I apologize, but I encountered an error. Please try again - I\'m here to help with your travel plans!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleActionClick = (action: string, data?: any) => {
    switch (action) {
      case 'show_transport':
        navigate('/transport-selector');
        break;
      case 'show_hotels':
        navigate('/booking');
        break;
      case 'show_dashboard':
        navigate('/dashboard');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';

    if (isSystem && message.data?.action) {
      return (
        <MessageAnimation key={message.id} delay={index * 0.1}>
          <div className="flex justify-center mb-6">
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 max-w-md">
              <p className="text-center mb-4 font-medium">{message.content}</p>
              <div className="flex justify-center space-x-3">
                <Button 
                  onClick={() => handleActionClick(message.data.action, message.data)}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Plane className="w-4 h-4 mr-2" />
                  View Transport Options
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="border-primary/30 hover:bg-primary/5"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Plan Trip
                </Button>
              </div>
            </Card>
          </div>
        </MessageAnimation>
      );
    }

    return (
      <MessageAnimation key={message.id} delay={index * 0.1}>
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
          <div className={`flex items-start space-x-3 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isUser ? 'bg-gradient-to-br from-primary to-primary/80' : 'bg-gradient-to-br from-secondary to-secondary/80'
            }`}>
              {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
            </div>
            
            <Card className={`p-4 relative ${
              isUser 
                ? 'bg-gradient-to-br from-primary to-primary/90 text-white border-primary/20' 
                : 'bg-card/50 backdrop-blur-sm border-border/50'
            }`}>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap m-0 leading-relaxed">{message.content}</p>
              </div>
              <div className={`text-xs mt-2 opacity-70 ${isUser ? 'text-white/70' : 'text-muted-foreground'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </Card>
          </div>
        </div>
      </MessageAnimation>
    );
  };

  return (
    <div className="h-screen flex relative overflow-hidden">
      {/* Background Elements */}
      <FloatingTravelIcons />
      <PlaneAnimation />
      
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />

      {/* Sidebar */}
      <EnhancedSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10 ml-0 lg:ml-80 transition-all duration-300">
        {/* Header */}
        <div className="border-b border-border/20 bg-card/30 backdrop-blur-md p-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden hover:bg-white/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    TravelVerse AI
                  </h1>
                  <p className="text-xs text-muted-foreground">Your intelligent travel companion</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-auto p-6 space-y-1">
          {messages.map((message, index) => renderMessage(message, index))}
          
          {isLoading && (
            <MessageAnimation>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm">AI is thinking</span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                    <div className="w-1 h-1 bg-primary rounded-full animate-ping delay-75" />
                    <div className="w-1 h-1 bg-primary rounded-full animate-ping delay-150" />
                  </div>
                </div>
              </div>
            </MessageAnimation>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border/20 bg-card/30 backdrop-blur-md p-4 sticky bottom-0 z-20">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell me about your dream destination... (e.g., 'Plan a trip for 4 people from Chennai to Dubai with ₹50,000 budget')"
                className="w-full min-h-[60px] max-h-32 p-4 pr-16 bg-background/50 backdrop-blur-sm border border-border/30 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 placeholder:text-muted-foreground"
                disabled={isLoading}
                rows={1}
              />
              <div className="absolute right-2 bottom-2 flex items-center space-x-2">
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="h-10 w-10 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50"
                >
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              💡 Pro tip: Be specific about destinations, dates, budget, and group size for personalized recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
