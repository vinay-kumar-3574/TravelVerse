
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Train, Clock, Users } from 'lucide-react';

interface TrainOption {
  id: string;
  trainName: string;
  trainNumber: string;
  departure: string;
  arrival: string;
  price: number;
  class: string;
  duration: string;
}

interface TrainOptionsProps {
  options: TrainOption[];
  onSelect: (option: TrainOption) => void;
  selectedOption?: TrainOption;
}

export const TrainOptions = ({ options, onSelect, selectedOption }: TrainOptionsProps) => {
  return (
    <div className="space-y-4">
      {options.map((option) => (
        <Card 
          key={option.id}
          className={`travel-card cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
            selectedOption?.id === option.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onSelect(option)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Train className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{option.trainName}</h3>
                  <p className="text-muted-foreground">{option.trainNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">₹{option.price.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">per person</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {option.departure} - {option.arrival}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{option.class}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {option.duration}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
