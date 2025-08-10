
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Plane, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  data?: any;
}

interface MessageListProps {
  messages: Message[];
  onActionClick?: (action: string, data?: any) => void;
}

export const MessageList = ({ messages, onActionClick }: MessageListProps) => {
  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';

    if (isSystem && message.data?.action) {
      return (
        <div key={message.id} className="flex justify-center mb-4">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <p className="text-center mb-3">{message.content}</p>
            <div className="flex justify-center space-x-2">
              <Button 
                onClick={() => onActionClick?.(message.data.action, message.data)}
                className="btn-travel"
              >
                <Plane className="w-4 h-4 mr-2" />
                View Options
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex space-x-3 max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <Avatar className="w-8 h-8">
            <AvatarFallback>
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          
          <Card className={`p-4 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <p className="whitespace-pre-wrap">{message.content}</p>
            <p className={`text-xs mt-2 ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              {format(message.timestamp, 'HH:mm')}
            </p>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {messages.map(renderMessage)}
    </div>
  );
};
