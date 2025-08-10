
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plane, Train, Bus, Clock, Users, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { aiService } from '@/api/aiService';
import { FlightOptions } from '@/features/TransportSelector/FlightOptions';
import { TrainOptions } from '@/features/TransportSelector/TrainOptions';
import { BusOptions } from '@/features/TransportSelector/BusOptions';

const TransportSelectorPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [selectedMode, setSelectedMode] = useState<'flight' | 'train' | 'bus'>('flight');
  const [transportOptions, setTransportOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<any>(null);

  const { currentTrip } = state;

  useEffect(() => {
    if (currentTrip) {
      loadTransportOptions();
    }
  }, [currentTrip, selectedMode]);

  const loadTransportOptions = async () => {
    if (!currentTrip) return;

    setIsLoading(true);
    try {
      const options = await aiService.generateFlightOptions(
        currentTrip.source,
        currentTrip.destination,
        currentTrip.budget,
        currentTrip.members
      );
      setTransportOptions(options);
    } catch (error) {
      console.error('Error loading transport options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (option: any) => {
    setSelectedOption(option);
  };

  const handleBookTransport = () => {
    if (selectedOption && currentTrip) {
      dispatch({
        type: 'UPDATE_TRIP',
        payload: {
          transportBooking: {
            ...selectedOption,
            bookingDate: new Date().toISOString(),
            status: 'confirmed'
          }
        }
      });
      navigate('/booking');
    }
  };

  if (!currentTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="travel-card max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">No Active Trip</h2>
            <p className="text-muted-foreground mb-4">
              Please start a new trip from the chat interface.
            </p>
            <Button onClick={() => navigate('/chat')}>
              Back to Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-gradient">
      <div className="absolute inset-0 bg-gradient-to-br from-travel-sky/20 via-transparent to-travel-ocean/20"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/chat')}
            className="hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Select Transportation</h1>
            <p className="text-muted-foreground">
              {currentTrip.source} → {currentTrip.destination}
            </p>
          </div>
          <div className="w-24" /> {/* Spacer */}
        </div>

        {/* Trip Summary */}
        <Card className="travel-card mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{currentTrip.members}</div>
                <div className="text-sm text-muted-foreground">Travelers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">₹{currentTrip.budget.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Budget</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{currentTrip.source}</div>
                <div className="text-sm text-muted-foreground">From</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{currentTrip.destination}</div>
                <div className="text-sm text-muted-foreground">To</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transport Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 p-1 bg-muted rounded-lg">
            {[
              { key: 'flight', icon: Plane, label: 'Flight' },
              { key: 'train', icon: Train, label: 'Train' },
              { key: 'bus', icon: Bus, label: 'Bus' }
            ].map(({ key, icon: Icon, label }) => (
              <Button
                key={key}
                variant={selectedMode === key ? 'default' : 'ghost'}
                onClick={() => setSelectedMode(key as any)}
                className="flex items-center space-x-2"
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Transport Options */}
        <div className="space-y-4 mb-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Finding best options for you...</p>
              </div>
            </div>
          ) : (
            transportOptions.map((option, index) => (
              <Card 
                key={option.id}
                className={`travel-card cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                  selectedOption?.id === option.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelectOption(option)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Plane className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{option.airline}</h3>
                        <p className="text-muted-foreground">{option.aircraft}</p>
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
                      <Badge variant={option.stops === 0 ? 'default' : 'secondary'}>
                        {option.stops === 0 ? 'Non-stop' : `${option.stops} stops`}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Book Button */}
        {selectedOption && (
          <div className="flex justify-center">
            <Button
              size="lg"
              className="btn-travel px-12 py-6 text-lg"
              onClick={handleBookTransport}
            >
              Book {selectedMode} - ₹{(selectedOption.price * currentTrip.members).toLocaleString()}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportSelectorPage;
