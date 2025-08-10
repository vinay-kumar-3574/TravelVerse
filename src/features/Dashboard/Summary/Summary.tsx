
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Wallet, 
  Camera, 
  Star, 
  Download,
  Share2,
  Heart
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const Summary = () => {
  const { state } = useApp();
  const { currentTrip } = state;

  const tripStats = {
    totalDays: 7,
    placesVisited: 12,
    photosUploaded: 48,
    budgetUsed: 35750,
    activitiesCompleted: 15,
    distanceTraveled: 245
  };

  const highlights = [
    {
      day: 1,
      title: "Arrival in Dubai",
      activity: "Burj Khalifa Visit",
      rating: 5,
      photo: "📸",
      note: "Amazing sunset view from the top!"
    },
    {
      day: 2,
      title: "Desert Safari",
      activity: "Camel Riding & BBQ",
      rating: 5,
      photo: "📸",
      note: "Unforgettable experience in the desert"
    },
    {
      day: 3,
      title: "Dubai Mall",
      activity: "Shopping & Aquarium",
      rating: 4,
      photo: "📸",
      note: "Great shopping but quite crowded"
    },
    {
      day: 4,
      title: "Marina Walk",
      activity: "Yacht Tour",
      rating: 5,
      photo: "📸",
      note: "Perfect weather for the boat ride"
    }
  ];

  const recommendations = [
    "Next time, allocate more time for the Gold Souk",
    "Consider visiting during cooler months (Nov-Mar)",
    "Book desert safari in advance for better prices",
    "Try more local Emirati restaurants",
    "Visit Dubai Frame - missed this time"
  ];

  const downloadReport = () => {
    // Simulate PDF download
    alert('Trip summary PDF downloaded!');
  };

  const shareTrip = () => {
    // Simulate sharing
    alert('Trip summary shared to social media!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Trip Summary</h2>
          <p className="text-muted-foreground">Complete overview of your travel experience</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={shareTrip}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button onClick={downloadReport} className="btn-travel">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Trip Overview */}
      <Card className="travel-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Trip Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{tripStats.totalDays}</div>
              <div className="text-sm text-muted-foreground">Days</div>
            </div>
            
            <div className="text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{tripStats.placesVisited}</div>
              <div className="text-sm text-muted-foreground">Places Visited</div>
            </div>
            
            <div className="text-center">
              <Camera className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{tripStats.photosUploaded}</div>
              <div className="text-sm text-muted-foreground">Photos</div>
            </div>
            
            <div className="text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{currentTrip?.members}</div>
              <div className="text-sm text-muted-foreground">Travelers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Summary */}
      <Card className="travel-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Budget Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total Budget</span>
              <span className="text-xl font-bold">₹{currentTrip?.budget.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Amount Spent</span>
              <span className="text-xl font-bold text-primary">₹{tripStats.budgetUsed.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Amount Saved</span>
              <span className="text-xl font-bold text-green-600">
                ₹{((currentTrip?.budget || 0) - tripStats.budgetUsed).toLocaleString()}
              </span>
            </div>
            
            <Progress 
              value={(tripStats.budgetUsed / (currentTrip?.budget || 1)) * 100} 
              className="h-3"
            />
            
            <div className="text-center text-sm text-muted-foreground">
              {(((tripStats.budgetUsed / (currentTrip?.budget || 1)) * 100).toFixed(1))}% of budget utilized
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trip Highlights */}
      <Card className="travel-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span>Trip Highlights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="px-3 py-1">
                    Day {highlight.day}
                  </Badge>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{highlight.title}</h4>
                    <div className="flex items-center space-x-1">
                      {[...Array(highlight.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{highlight.activity}</p>
                  <p className="text-sm italic">{highlight.note}</p>
                </div>
                
                <div className="text-2xl">{highlight.photo}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="travel-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span>AI Recommendations for Next Trip</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Final Rating */}
      <Card className="travel-card bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold">How was your trip?</h3>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/20"
                >
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                </Button>
              ))}
            </div>
            <p className="text-muted-foreground">Rate your overall experience</p>
            <Button className="btn-travel">
              Submit Feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
