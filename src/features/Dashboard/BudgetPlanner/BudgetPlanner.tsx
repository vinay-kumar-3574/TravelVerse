
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, PlusCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const BudgetPlanner = () => {
  const { state } = useApp();
  const { currentTrip } = state;

  const [budgetBreakdown] = useState({
    transport: { allocated: 20000, spent: 18000, category: 'Transportation' },
    accommodation: { allocated: 15000, spent: 12000, category: 'Hotels' },
    food: { allocated: 8000, spent: 3500, category: 'Food & Dining' },
    activities: { allocated: 5000, spent: 1200, category: 'Activities' },
    shopping: { allocated: 2000, spent: 800, category: 'Shopping' },
    miscellaneous: { allocated: 1000, spent: 250, category: 'Miscellaneous' }
  });

  const totalAllocated = Object.values(budgetBreakdown).reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = Object.values(budgetBreakdown).reduce((sum, item) => sum + item.spent, 0);
  const remaining = (currentTrip?.budget || 50000) - totalSpent;

  const expenses = [
    { date: '2024-01-15', description: 'Flight Booking', amount: 18000, category: 'transport' },
    { date: '2024-01-16', description: 'Hotel Advance', amount: 5000, category: 'accommodation' },
    { date: '2024-01-17', description: 'Airport Transfer', amount: 500, category: 'transport' },
    { date: '2024-01-18', description: 'Dinner at Restaurant', amount: 1500, category: 'food' }
  ];

  const getBudgetStatus = (allocated: number, spent: number) => {
    const percentage = (spent / allocated) * 100;
    if (percentage >= 90) return { status: 'danger', color: 'destructive' };
    if (percentage >= 70) return { status: 'warning', color: 'secondary' };
    return { status: 'good', color: 'default' };
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Budget Planner</h2>
        <p className="text-muted-foreground">Track and manage your travel expenses</p>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="travel-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{currentTrip?.budget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Allocated for trip</p>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spent So Far</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((totalSpent / (currentTrip?.budget || 1)) * 100).toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{remaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available to spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="travel-card">
        <CardHeader>
          <CardTitle>Budget Breakdown by Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(budgetBreakdown).map(([key, budget]) => {
            const percentage = (budget.spent / budget.allocated) * 100;
            const status = getBudgetStatus(budget.allocated, budget.spent);
            
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{budget.category}</span>
                    <Badge variant={status.color as any}>
                      {percentage >= 90 ? 'Over Budget' : percentage >= 70 ? 'Warning' : 'On Track'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ₹{budget.spent.toLocaleString()} / ₹{budget.allocated.toLocaleString()}
                  </div>
                </div>
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className={`h-2 ${percentage >= 90 ? 'bg-red-100' : percentage >= 70 ? 'bg-yellow-100' : ''}`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{percentage.toFixed(1)}% used</span>
                  <span>₹{(budget.allocated - budget.spent).toLocaleString()} remaining</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card className="travel-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Expenses</CardTitle>
          <Button variant="outline" size="sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.map((expense, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{expense.description}</div>
                  <div className="text-sm text-muted-foreground">{expense.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₹{expense.amount.toLocaleString()}</div>
                  <Badge variant="outline" className="text-xs">
                    {budgetBreakdown[expense.category as keyof typeof budgetBreakdown]?.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Alerts */}
      <Card className="travel-card border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-800">
            <AlertTriangle className="w-5 h-5" />
            <span>Budget Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-orange-700">
            <p>• Transportation budget is 90% utilized</p>
            <p>• Consider setting aside more budget for activities</p>
            <p>• You're ₹{remaining.toLocaleString()} under budget - great job!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
