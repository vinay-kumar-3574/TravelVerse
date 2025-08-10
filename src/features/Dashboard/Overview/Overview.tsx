
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Clock, Wallet, Users } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const Overview = () => {
  const { state } = useApp();
  const { currentTrip } = state;

  if (!currentTrip) return null;

  const daysUntilTrip = Math.max(0, 7); // Mock data
  const budgetUsed = 30000;
  const budgetPercentage = (budgetUsed / currentTrip.budget) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Trip Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="travel-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Until Trip</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysUntilTrip}</div>
            <p className="text-xs text-muted-foreground">Days remaining</p>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{budgetUsed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              of ₹{currentTrip.budget.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Travelers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentTrip.members}</div>
            <p className="text-xs text-muted-foreground">People</p>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trip Status</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="capitalize">
              {currentTrip.status}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Current status</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card className="travel-card">
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Used: ₹{budgetUsed.toLocaleString()}</span>
              <span>Remaining: ₹{(currentTrip.budget - budgetUsed).toLocaleString()}</span>
            </div>
            <Progress value={budgetPercentage} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {budgetPercentage.toFixed(1)}% of budget used
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trip Details */}
      <Card className="travel-card">
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">From:</span>
              <span>{currentTrip.source}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">To:</span>
              <span>{currentTrip.destination}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Budget:</span>
              <span>₹{currentTrip.budget.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Group Size:</span>
              <span>{currentTrip.members} people</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
