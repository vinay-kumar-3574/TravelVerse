
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Plane, Train, Bus } from 'lucide-react';

export const WhatIfScenarios = () => {
  const [selectedScenario, setSelectedScenario] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenarios] = useState([
    {
      id: 'flight_delay',
      title: 'Flight Delayed by 6+ Hours',
      impact: 'high',
      description: 'Your outbound flight is delayed significantly',
      recommendations: [
        'Airport hotel voucher available for delays over 8 hours',
        'Meal vouchers provided by airline',
        'Reschedule first day activities to tomorrow',
        'Contact hotel to extend check-in time',
        'Alternative flight options on partner airlines'
      ]
    },
    {
      id: 'budget_overrun',
      title: 'Budget Exceeded by 20%',
      impact: 'medium',
      description: 'Current spending pace will exceed budget',
      recommendations: [
        'Switch to budget-friendly restaurants for remaining days',
        'Use public transport instead of taxis',
        'Look for free activities and attractions',
        'Consider changing to a cheaper hotel',
        'Set daily spending limits'
      ]
    },
    {
      id: 'weather_bad',
      title: 'Severe Weather Warning',
      impact: 'medium',
      description: 'Heavy rains/storms predicted for 2 days',
      recommendations: [
        'Indoor activities: Dubai Mall, Museum, Aquarium',
        'Spa and wellness experiences',
        'Cultural centers and art galleries',
        'Hotel amenities exploration',
        'Cooking classes or workshops'
      ]
    },
    {
      id: 'health_emergency',
      title: 'Medical Emergency',
      impact: 'high',
      description: 'A family member needs medical attention',
      recommendations: [
        'Nearest hospital: Dubai Hospital (24/7)',
        'Travel insurance claim process',
        'Embassy contact for serious cases',
        'Pharmacy locations for medicines',
        'Emergency contact numbers activated'
      ]
    }
  ]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const generateAlternatives = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const alternativeOptions = [
    {
      type: 'transport',
      title: 'Alternative Transport Options',
      options: [
        { icon: <Train className="w-4 h-4" />, name: 'Train to Mumbai + Flight', cost: '₹15,000', time: '+4 hours' },
        { icon: <Bus className="w-4 h-4" />, name: 'Bus to Bangalore + Flight', cost: '₹12,000', time: '+8 hours' },
        { icon: <Plane className="w-4 h-4" />, name: 'Via Doha (Qatar Airways)', cost: '₹22,000', time: '+2 hours' }
      ]
    },
    {
      type: 'accommodation',
      title: 'Budget-Friendly Hotels',
      options: [
        { name: 'Al Seef Heritage Hotel', cost: '₹8,000/night', rating: '4.2 stars' },
        { name: 'Citymax Hotel Bur Dubai', cost: '₹6,500/night', rating: '4.0 stars' },
        { name: 'Rove Downtown', cost: '₹9,500/night', rating: '4.4 stars' }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">What-If Scenarios</h2>
          <p className="text-muted-foreground">Plan for contingencies and alternative options</p>
        </div>
        <Button 
          onClick={generateAlternatives}
          disabled={isGenerating}
          className="btn-travel"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Analyzing...' : 'Generate Alternatives'}
        </Button>
      </div>

      {/* Scenario Selection */}
      <Card className="travel-card">
        <CardHeader>
          <CardTitle>Select a Scenario to Explore</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a what-if scenario" />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  {scenario.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Scenario Details */}
      {selectedScenario && (
        <Card className="travel-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                {getImpactIcon(scenarios.find(s => s.id === selectedScenario)?.impact || 'low')}
                <span>{scenarios.find(s => s.id === selectedScenario)?.title}</span>
              </CardTitle>
              <Badge variant={getImpactColor(scenarios.find(s => s.id === selectedScenario)?.impact || 'low') as any}>
                {scenarios.find(s => s.id === selectedScenario)?.impact} Impact
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {scenarios.find(s => s.id === selectedScenario)?.description}
            </p>
            
            <h4 className="font-semibold mb-3">Recommended Actions:</h4>
            <ul className="space-y-2">
              {scenarios.find(s => s.id === selectedScenario)?.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Alternative Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {alternativeOptions.map((section) => (
          <Card key={section.type} className="travel-card">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.options.map((option, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {'icon' in option && option.icon}
                      <div>
                        <div className="font-medium">{option.name}</div>
                        {'time' in option && (
                          <div className="text-sm text-muted-foreground">{option.time}</div>
                        )}
                        {'rating' in option && (
                          <div className="text-sm text-muted-foreground">{option.rating}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{option.cost}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Emergency Contacts */}
      <Card className="travel-card bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span>Emergency Preparedness</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Local Emergency Numbers</h4>
              <ul className="space-y-1 text-red-700">
                <li>• Police: 999</li>
                <li>• Ambulance: 999</li>
                <li>• Fire: 997</li>
                <li>• Tourist Police: 901</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Important Contacts</h4>
              <ul className="space-y-1 text-red-700">
                <li>• Travel Insurance: +91-XXXX-XXXX</li>
                <li>• Embassy: +971-4-XXX-XXXX</li>
                <li>• Hotel Concierge: +971-4-XXX-XXXX</li>
                <li>• Family Emergency: +91-XXXX-XXXX</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
