
import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  Calendar, 
  Globe2, 
  MessageCircle, 
  Wallet, 
  RefreshCw, 
  AlertTriangle, 
  FileText,
  User,
  Settings,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Overview } from '@/features/Dashboard/Overview/Overview';
import { Planner } from '@/features/Dashboard/Planner/Planner';
import { Translator } from '@/features/Dashboard/Translator/Translator';
import { PersonalAssistant } from '@/features/Dashboard/PersonalAssistant/PersonalAssistant';
import { BudgetPlanner } from '@/features/Dashboard/BudgetPlanner/BudgetPlanner';
import { WhatIfScenarios } from '@/features/Dashboard/WhatIfScenarios/WhatIfScenarios';
import { SOSOption } from '@/features/Dashboard/SOS/SOSOption';
import { Summary } from '@/features/Dashboard/Summary/Summary';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useApp();
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { currentTrip, user } = state;

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'planner', label: 'AI Trip Planner', icon: Calendar, path: '/dashboard/planner' },
    { id: 'translator', label: 'Language Translator', icon: Globe2, path: '/dashboard/translator' },
    { id: 'assistant', label: 'AI Personal Assistant', icon: MessageCircle, path: '/dashboard/assistant' },
    { id: 'budget', label: 'Budget Planner', icon: Wallet, path: '/dashboard/budget' },
    { id: 'whatif', label: 'What If Scenarios', icon: RefreshCw, path: '/dashboard/whatif' },
    { id: 'sos', label: 'SOS Option', icon: AlertTriangle, path: '/dashboard/sos' },
    { id: 'summary', label: 'Trip Summary', icon: FileText, path: '/dashboard/summary' }
  ];

  const currentPath = location.pathname;
  const activeItem = menuItems.find(item => item.path === currentPath) || menuItems[0];

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">{user?.fullName || 'Traveler'}</h3>
            <p className="text-sm text-muted-foreground">
              {currentTrip?.destination || 'No active trip'}
            </p>
          </div>
        </div>
        
        {currentTrip && (
          <div className="text-sm text-muted-foreground">
            <p>Budget: ₹{currentTrip.budget.toLocaleString()}</p>
            <p>Status: <span className="capitalize text-primary">{currentTrip.status}</span></p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
            >
              <Icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={toggleTheme}
        >
          {isDark ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>
      </div>
    </div>
  );

  if (!currentTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hero-gradient">
        <Card className="travel-card max-w-md text-center">
          <div className="p-8">
            <h2 className="text-xl font-semibold mb-4">No Active Trip</h2>
            <p className="text-muted-foreground mb-6">
              Start planning your next adventure to access the dashboard.
            </p>
            <Button onClick={() => navigate('/chat')} className="btn-travel">
              Start New Trip
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{activeItem.label}</h1>
              <p className="text-muted-foreground">
                {currentTrip.source} → {currentTrip.destination}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/chat')}
              className="hidden md:flex"
            >
              Back to Chat
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-muted/20">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/translator" element={<Translator />} />
            <Route path="/assistant" element={<PersonalAssistant />} />
            <Route path="/budget" element={<BudgetPlanner />} />
            <Route path="/whatif" element={<WhatIfScenarios />} />
            <Route path="/sos" element={<SOSOption />} />
            <Route path="/summary" element={<Summary />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
