
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Star, RefreshCw } from 'lucide-react';

export const Planner = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState([
    {
      day: 1,
      title: "Arrival & City Tour",
      activities: [
        { time: "09:00", activity: "Arrive at Dubai Airport", location: "Dubai International Airport" },
        { time: "11:00", activity: "Check-in to Hotel", location: "Downtown Dubai" },
        { time: "15:00", activity: "Visit Burj Khalifa", location: "Downtown Dubai" },
        { time: "19:00", activity: "Dubai Mall Shopping", location: "Dubai Mall" }
      ]
    },
    {
      day: 2,
      title: "Desert Safari Adventure",
      activities: [
        { time: "10:00", activity: "Desert Safari Pickup", location: "Hotel Lobby" },
        { time: "16:00", activity: "Dune Bashing", location: "Arabian Desert" },
        { time: "18:00", activity: "Camel Riding", location: "Desert Camp" },
        { time: "20:00", activity: "BBQ Dinner & Shows", location: "Desert Camp" }
      ]
    }
  ]);

  const generateNewItinerary = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">AI Trip Planner</h2>
          <p className="text-muted-foreground">Optimized daily itinerary for your trip</p>
        </div>
        <Button 
          onClick={generateNewItinerary} 
          disabled={isGenerating}
          className="btn-travel"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Regenerate'}
        </Button>
      </div>

      <div className="space-y-6">
        {itinerary.map((day) => (
          <Card key={day.day} className="travel-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Badge variant="default" className="px-3 py-1">
                  Day {day.day}
                </Badge>
                <span>{day.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {day.activities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-16 text-sm font-medium text-primary">
                      {activity.time}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{activity.activity}</h4>
                        <Star className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1" />
                        {activity.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="travel-card bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Smart Optimization</h3>
            <p className="text-sm text-muted-foreground">
              This itinerary is optimized based on your budget, preferences, and local insights.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
