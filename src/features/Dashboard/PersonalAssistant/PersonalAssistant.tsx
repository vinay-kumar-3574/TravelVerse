
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export const PersonalAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your personal travel assistant. I can help you with recommendations, answer questions about your destination, suggest activities, or just have a friendly chat. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    "What's the weather like?",
    "Best local restaurants?",
    "Emergency contacts",
    "Currency exchange rates",
    "Local customs and etiquette",
    "Popular attractions nearby"
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: generateAIResponse(inputValue),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsLoading(false);
  };

  const generateAIResponse = (input: string): string => {
    const responses: { [key: string]: string } = {
      weather: "The weather in Dubai is currently sunny with temperatures around 28°C. Perfect for outdoor activities! Don't forget your sunscreen and stay hydrated.",
      restaurant: "Here are some must-try restaurants in Dubai:\n\n• Al Hadheerah - Traditional Emirati cuisine\n• Pierchic - Overwater fine dining\n• Ravi Restaurant - Authentic Pakistani food\n• La Petite Maison - French Mediterranean",
      emergency: "Important emergency contacts for Dubai:\n\n• Police: 999\n• Ambulance: 999\n• Fire: 997\n• Tourist Police: 901\n\nYour hotel concierge can also assist with any emergencies.",
      currency: "Current exchange rates:\n• 1 USD = 3.67 AED\n• 1 EUR = 4.02 AED\n• 1 GBP = 4.65 AED\n\nATMs are widely available, and most places accept credit cards.",
      customs: "Local customs to remember:\n\n• Dress modestly in public areas\n• Friday is a holy day (many shops close)\n• No public displays of affection\n• Respect during prayer times\n• Tipping 10-15% is customary",
      attractions: "Popular attractions near you:\n\n• Burj Khalifa & Dubai Mall\n• Dubai Marina & JBR Beach\n• Gold & Spice Souks\n• Dubai Museum\n• Desert Safari experiences"
    };

    const lowercaseInput = input.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
      if (lowercaseInput.includes(key)) {
        return response;
      }
    }

    return "That's an interesting question! Based on your location and travel plans, I'd recommend checking with local guides or your hotel concierge for the most up-to-date information. Is there anything specific about Dubai you'd like to know more about?";
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">AI Personal Assistant</h2>
        <p className="text-muted-foreground">Your 24/7 travel companion for questions and guidance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="travel-card h-[600px] flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span>Chat with AI Assistant</span>
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <Card className={`p-3 ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </Card>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <Card className="p-3 bg-muted">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your trip..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Questions */}
        <div className="space-y-4">
          <Card className="travel-card">
            <CardHeader>
              <CardTitle className="text-lg">Quick Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start h-auto p-3"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="travel-card bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <Bot className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-2">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">
                  Get intelligent responses based on your location, preferences, and travel plans.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
