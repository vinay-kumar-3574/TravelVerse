
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Check, Hotel, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { aiService } from '@/api/aiService';
import { PaymentDialog } from '@/features/Booking/PaymentDialog';

const BookingPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [hotelOptions, setHotelOptions] = useState<any[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<'transport' | 'hotel'>('transport');

  const { currentTrip } = state;

  useEffect(() => {
    if (currentTrip) {
      loadHotelOptions();
    }
  }, [currentTrip]);

  const loadHotelOptions = async () => {
    if (!currentTrip) return;

    setIsLoading(true);
    try {
      const options = await aiService.generateHotelOptions(
        currentTrip.destination,
        currentTrip.budget,
        currentTrip.members
      );
      setHotelOptions(options);
    } catch (error) {
      console.error('Error loading hotel options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHotel = (hotel: any) => {
    setSelectedHotel(hotel);
  };

  const handleBookHotel = () => {
    if (selectedHotel) {
      setPaymentType('hotel');
      setShowPayment(true);
    }
  };

  const handlePaymentComplete = (type: 'transport' | 'hotel') => {
    if (type === 'hotel' && selectedHotel && currentTrip) {
      dispatch({
        type: 'UPDATE_TRIP',
        payload: {
          hotelBooking: {
            ...selectedHotel,
            bookingDate: new Date().toISOString(),
            status: 'confirmed',
            checkIn: new Date().toISOString(),
            checkOut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          status: 'booked'
        }
      });
      
      // Navigate to dashboard after successful booking
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
    setShowPayment(false);
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

  const transportBooking = currentTrip.transportBooking;

  return (
    <div className="min-h-screen bg-hero-gradient">
      <div className="absolute inset-0 bg-gradient-to-br from-travel-sky/20 via-transparent to-travel-ocean/20"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/transport-selector')}
            className="hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
            <p className="text-muted-foreground">
              {currentTrip.source} → {currentTrip.destination}
            </p>
          </div>
          <div className="w-24" />
        </div>

        {/* Transport Booking Summary */}
        {transportBooking && (
          <Card className="travel-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Transport Booked</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold">{transportBooking.airline}</h4>
                  <p className="text-muted-foreground">{transportBooking.aircraft}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Flight Time</h4>
                  <p className="text-muted-foreground">
                    {transportBooking.departure} - {transportBooking.arrival}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Total Cost</h4>
                  <p className="text-primary font-bold text-lg">
                    ₹{(transportBooking.price * currentTrip.members).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hotel Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Select Your Accommodation</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Finding perfect hotels for you...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {hotelOptions.map((hotel) => (
                <Card 
                  key={hotel.id}
                  className={`travel-card cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    selectedHotel?.id === hotel.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelectHotel(hotel)}
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg flex items-center justify-center">
                    <Hotel className="w-12 h-12 text-primary" />
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{hotel.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{hotel.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3">{hotel.location}</p>
                    <p className="text-muted-foreground text-sm mb-3">{hotel.distance}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {hotel.amenities.slice(0, 3).map((amenity: string) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{hotel.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          ₹{hotel.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">per night</div>
                      </div>
                      <Button 
                        variant={selectedHotel?.id === hotel.id ? "default" : "outline"}
                        size="sm"
                      >
                        {selectedHotel?.id === hotel.id ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Book Hotel Button */}
        {selectedHotel && (
          <div className="flex justify-center">
            <Button
              size="lg"
              className="btn-travel px-12 py-6 text-lg"
              onClick={handleBookHotel}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Book Hotel - ₹{(selectedHotel.price * 7).toLocaleString()} (7 nights)
            </Button>
          </div>
        )}

        {/* Payment Dialog */}
        <PaymentDialog
          open={showPayment}
          onOpenChange={setShowPayment}
          amount={selectedHotel ? selectedHotel.price * 7 : 0}
          type={paymentType}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    </div>
  );
};

export default BookingPage;
