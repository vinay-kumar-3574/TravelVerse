import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, MapPin, Users, IndianRupee, Plane } from 'lucide-react';

interface MissingParamPromptProps {
  missingParams: string[];
  partialData: any;
  onParamProvided: (param: string, value: string) => void;
  onComplete: () => void;
}

export const MissingParamPrompt: React.FC<MissingParamPromptProps> = ({
  missingParams,
  partialData,
  onParamProvided,
  onComplete
}) => {
  const [paramInputs, setParamInputs] = useState<{ [key: string]: string }>({});
  const [currentParamIndex, setCurrentParamIndex] = useState(0);

  const getParamIcon = (param: string) => {
    switch (param) {
      case 'source':
        return <Plane className="w-4 h-4" />;
      case 'destination':
        return <MapPin className="w-4 h-4" />;
      case 'budget':
        return <IndianRupee className="w-4 h-4" />;
      case 'members':
        return <Users className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getParamLabel = (param: string) => {
    switch (param) {
      case 'source':
        return 'Where are you traveling from?';
      case 'destination':
        return 'Where do you want to go?';
      case 'budget':
        return 'What\'s your budget?';
      case 'members':
        return 'How many people are traveling?';
      default:
        return param;
    }
  };

  const getParamPlaceholder = (param: string) => {
    switch (param) {
      case 'source':
        return 'e.g., Chennai, Mumbai, Delhi, Bangalore...';
      case 'destination':
        return 'e.g., Dubai, London, Paris, Singapore...';
      case 'budget':
        return 'e.g., 50000, 1 lakh, 75k, 100000...';
      case 'members':
        return 'e.g., 2, 4, 6, 8...';
      default:
        return '';
    }
  };

  const getQuickSuggestions = (param: string) => {
    switch (param) {
      case 'source':
        return ['Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Kolkata'];
      case 'destination':
        return ['Dubai', 'London', 'Paris', 'Singapore', 'Bangkok', 'Tokyo'];
      case 'budget':
        return ['25000', '50000', '75000', '100000', '150000', '200000'];
      case 'members':
        return ['1', '2', '4', '6', '8', '10'];
      default:
        return [];
    }
  };

  const getParamExamples = (param: string) => {
    switch (param) {
      case 'source':
        return [
          'I\'m in Chennai',
          'Leaving from Mumbai', 
          'Currently in Delhi',
          'Starting from Bangalore'
        ];
      case 'destination':
        return [
          'I want to visit Dubai',
          'Going to London',
          'Planning to see Paris',
          'Dream destination is Singapore'
        ];
      case 'budget':
        return [
          '₹50,000',
          'Around 1 lakh',
          'Budget is 75k',
          'About 100 thousand'
        ];
      case 'members':
        return [
          'We are 4 people',
          'Family of 6',
          'Just me and my friend',
          'Group of 8 travelers'
        ];
      default:
        return [];
    }
  };

  const getParamDescription = (param: string) => {
    switch (param) {
      case 'source':
        return 'Tell me where you\'re starting your journey from';
      case 'destination':
        return 'Where would you like to travel to?';
      case 'budget':
        return 'What\'s your total budget for this trip?';
      case 'members':
        return 'How many people will be traveling together?';
      default:
        return '';
    }
  };

  const handleParamSubmit = (param: string) => {
    const value = paramInputs[param];
    if (value && value.trim()) {
      onParamProvided(param, value.trim());
      setParamInputs(prev => ({ ...prev, [param]: '' }));
      
      // Move to next parameter or complete
      if (currentParamIndex < missingParams.length - 1) {
        setCurrentParamIndex(prev => prev + 1);
      } else {
        onComplete();
      }
    }
  };

  const handleQuickSuggestion = (param: string, suggestion: string) => {
    onParamProvided(param, suggestion);
    
    // Move to next parameter or complete
    if (currentParamIndex < missingParams.length - 1) {
      setCurrentParamIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const currentParam = missingParams[currentParamIndex];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Plane className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Let's Complete Your Travel Plan! ✈️
        </h3>
        <p className="text-gray-600 text-sm">
          I just need a few more details to create the perfect trip for you
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Progress</span>
          <span>{currentParamIndex + 1} of {missingParams.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentParamIndex + 1) / missingParams.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current parameter input */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            {getParamIcon(currentParam)}
          </div>
          <div>
            <h4 className="font-medium text-gray-800">{getParamLabel(currentParam)}</h4>
            <p className="text-sm text-gray-500 mb-1">
              Step {currentParamIndex + 1} of {missingParams.length}
            </p>
            <p className="text-xs text-gray-600">
              {getParamDescription(currentParam)}
            </p>
          </div>
        </div>

        <div className="flex space-x-2 mb-3">
          <Input
            value={paramInputs[currentParam] || ''}
            onChange={(e) => setParamInputs(prev => ({ ...prev, [currentParam]: e.target.value }))}
            placeholder={getParamPlaceholder(currentParam)}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleParamSubmit(currentParam)}
          />
          <Button
            onClick={() => handleParamSubmit(currentParam)}
            disabled={!paramInputs[currentParam]?.trim()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-2 mb-3">
          {getQuickSuggestions(currentParam).map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => handleQuickSuggestion(currentParam, suggestion)}
              className="text-xs border-blue-200 hover:bg-blue-50"
            >
              {suggestion}
            </Button>
          ))}
        </div>

        {/* Examples */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            <span className="font-medium">Try these natural ways to tell me:</span>
          </p>
          <div className="grid grid-cols-1 gap-2">
            {getParamExamples(currentParam).map((example, index) => (
              <div
                key={index}
                className="text-xs text-gray-700 bg-white px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-200 border border-gray-100 transition-all duration-200 hover:shadow-sm"
                onClick={() => {
                  setParamInputs(prev => ({ ...prev, [currentParam]: example }));
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">"{example}"</span>
                  <span className="text-blue-500 text-xs">Click to use</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Helpful tip */}
        <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 text-sm">💭</span>
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">Quick tip:</p>
              <p>Be as specific as possible! Instead of "somewhere nice", try "I want to visit Paris" or "Planning to go to Singapore". This helps me find the best travel options for you.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary of what we have so far */}
      {Object.keys(partialData).some(key => partialData[key]) && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h5 className="font-medium text-gray-800 mb-2">What we know so far:</h5>
          <div className="flex flex-wrap gap-2">
            {partialData.source && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Plane className="w-3 h-3 mr-1" />
                From: {partialData.source}
              </Badge>
            )}
            {partialData.destination && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <MapPin className="w-3 h-3 mr-1" />
                To: {partialData.destination}
              </Badge>
            )}
            {partialData.budget && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <IndianRupee className="w-3 h-3 mr-1" />
                Budget: ₹{partialData.budget.toLocaleString()}
              </Badge>
            )}
            {partialData.members && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                <Users className="w-3 h-3 mr-1" />
                Travelers: {partialData.members}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Skip option */}
      <div className="text-center mt-4">
        <Button
          variant="ghost"
          onClick={onComplete}
          className="text-gray-500 hover:text-gray-700"
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
};
