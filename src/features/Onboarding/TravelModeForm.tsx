
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Plane, Train, Bus, MapPin } from 'lucide-react';

interface TravelModeFormProps {
  data: any;
  onUpdate: (data: any) => void;
}

export const TravelModeForm: React.FC<TravelModeFormProps> = ({ data, onUpdate }) => {
  const travelModes = [
    {
      value: 'flight',
      label: 'Flight',
      icon: Plane,
      description: 'Fast and convenient for long distances'
    },
    {
      value: 'train',
      label: 'Train',
      icon: Train,
      description: 'Comfortable and scenic journey'
    },
    {
      value: 'bus',
      label: 'Bus',
      icon: Bus,
      description: 'Budget-friendly travel option'
    },
    {
      value: 'any',
      label: 'Any Mode',
      icon: MapPin,
      description: 'Let me choose the best option for each trip'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Preferred Travel Mode</h3>
        <p className="text-muted-foreground">
          Select your preferred way to travel. You can always change this later.
        </p>
      </div>

      <RadioGroup
        value={data.preferredTravelMode || ''}
        onValueChange={(value) => onUpdate({ ...data, preferredTravelMode: value })}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {travelModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <div key={mode.value}>
              <RadioGroupItem
                value={mode.value}
                id={mode.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={mode.value}
                className="cursor-pointer"
              >
                <Card className="peer-checked:ring-2 peer-checked:ring-primary hover:shadow-md transition-all">
                  <CardContent className="p-6 text-center">
                    <Icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                    <h4 className="font-semibold mb-2">{mode.label}</h4>
                    <p className="text-sm text-muted-foreground">{mode.description}</p>
                  </CardContent>
                </Card>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};
