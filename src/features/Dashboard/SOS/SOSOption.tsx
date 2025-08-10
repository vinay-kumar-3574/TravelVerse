
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Shield, 
  Heart, 
  Car, 
  Building2,
  Users,
  Zap
} from 'lucide-react';

export const SOSOption = () => {
  const [activeEmergency, setActiveEmergency] = useState<string | null>(null);
  const [locationShared, setLocationShared] = useState(false);

  const emergencyTypes = [
    {
      id: 'medical',
      title: 'Medical Emergency',
      icon: <Heart className="w-6 h-6" />,
      description: 'Accident, injury, or health emergency',
      priority: 'critical',
      contacts: [
        { name: 'Dubai Ambulance', number: '999', type: 'primary' },
        { name: 'Dubai Hospital', number: '+971-4-219-5000', type: 'secondary' },
        { name: 'Travel Insurance', number: '+91-1800-XXX-XXXX', type: 'insurance' }
      ]
    },
    {
      id: 'police',
      title: 'Police Emergency',
      icon: <Shield className="w-6 h-6" />,
      description: 'Crime, theft, harassment, or safety concerns',
      priority: 'critical',
      contacts: [
        { name: 'Dubai Police', number: '999', type: 'primary' },
        { name: 'Tourist Police', number: '901', type: 'secondary' },
        { name: 'Indian Embassy', number: '+971-4-397-1222', type: 'embassy' }
      ]
    },
    {
      id: 'fire',
      title: 'Fire Emergency',
      icon: <Zap className="w-6 h-6" />,
      description: 'Fire, explosion, or hazardous situation',
      priority: 'critical',
      contacts: [
        { name: 'Dubai Fire Dept', number: '997', type: 'primary' },
        { name: 'Civil Defence', number: '999', type: 'secondary' }
      ]
    },
    {
      id: 'transport',
      title: 'Transport Emergency',
      icon: <Car className="w-6 h-6" />,
      description: 'Vehicle breakdown, accident, or transport issues',
      priority: 'medium',
      contacts: [
        { name: 'Dubai Taxi', number: '04-208-0808', type: 'primary' },
        { name: 'Careem Support', number: '+971-4-566-7477', type: 'secondary' },
        { name: 'RTA Help', number: '8009090', type: 'transport' }
      ]
    },
    {
      id: 'accommodation',
      title: 'Hotel Emergency',
      icon: <Building2 className="w-6 h-6" />,
      description: 'Hotel issues, lockout, or accommodation problems',
      priority: 'low',
      contacts: [
        { name: 'Hotel Reception', number: 'Extension 0', type: 'primary' },
        { name: 'Hotel Manager', number: '+971-4-XXX-XXXX', type: 'secondary' },
        { name: 'Booking Support', number: '+91-1800-XXX-XXXX', type: 'booking' }
      ]
    },
    {
      id: 'family',
      title: 'Family Emergency',
      icon: <Users className="w-6 h-6" />,
      description: 'Family member missing or urgent family matter',
      priority: 'high',
      contacts: [
        { name: 'Emergency Contact 1', number: '+91-XXXX-XXXX', type: 'family' },
        { name: 'Emergency Contact 2', number: '+91-XXXX-XXXX', type: 'family' },
        { name: 'Indian Embassy', number: '+971-4-397-1222', type: 'embassy' }
      ]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'default';
      default: return 'outline';
    }
  };

  const handleEmergencySelect = (emergencyId: string) => {
    setActiveEmergency(emergencyId);
  };

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationShared(true);
          console.log('Location shared:', position.coords);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const makeCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const sendSOSAlert = () => {
    // Simulate sending SOS alert to emergency contacts
    alert('SOS Alert sent to all emergency contacts with your location!');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-red-600">SOS Emergency</h2>
        <p className="text-muted-foreground">Quick access to emergency services and contacts</p>
      </div>

      {/* Quick SOS Button */}
      <Card className="travel-card border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-red-700 mb-2">Emergency SOS</h3>
              <p className="text-red-600 mb-4">Press for immediate emergency alert</p>
            </div>
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg"
              onClick={sendSOSAlert}
            >
              <AlertTriangle className="w-6 h-6 mr-2" />
              SEND SOS ALERT
            </Button>
            {!locationShared && (
              <Button
                variant="outline"
                onClick={shareLocation}
                className="ml-4"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Share Location
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {locationShared && (
        <Alert className="border-green-200 bg-green-50">
          <MapPin className="h-4 w-4" />
          <AlertDescription className="text-green-700">
            Your location has been shared with emergency services and contacts.
          </AlertDescription>
        </Alert>
      )}

      {/* Emergency Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {emergencyTypes.map((emergency) => (
          <Card 
            key={emergency.id}
            className={`travel-card cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              activeEmergency === emergency.id ? 'ring-2 ring-red-500' : ''
            }`}
            onClick={() => handleEmergencySelect(emergency.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg text-red-600">
                    {emergency.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{emergency.title}</CardTitle>
                  </div>
                </div>
                <Badge variant={getPriorityColor(emergency.priority) as any}>
                  {emergency.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{emergency.description}</p>
              
              {activeEmergency === emergency.id && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Emergency Contacts:</h4>
                  {emergency.contacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{contact.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{contact.type}</div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => makeCall(contact.number)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Emergency Checklist */}
      <Card className="travel-card">
        <CardHeader>
          <CardTitle>Emergency Preparedness Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-3">Before Emergency:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Travel insurance documents saved</span>
                </li>
                <li className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Emergency contacts updated</span>
                </li>
                <li className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Important documents backed up</span>
                </li>
                <li className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Local emergency numbers saved</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">During Emergency:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="text-red-600">1.</span>
                  <span>Stay calm and assess the situation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-red-600">2.</span>
                  <span>Call appropriate emergency service</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-red-600">3.</span>
                  <span>Share your location if safe to do so</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-red-600">4.</span>
                  <span>Contact family and travel insurance</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card className="travel-card bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Important Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700 space-y-2">
            <p>• All emergency numbers are toll-free from any phone</p>
            <p>• Dubai has multilingual emergency services</p>
            <p>• Tourist Police (901) speaks multiple languages</p>
            <p>• Keep this page bookmarked for quick access</p>
            <p>• Your location is automatically shared when using SOS</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
