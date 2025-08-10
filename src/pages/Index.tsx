
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe, MapPin, Users, Sparkles, Plane, Shield, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const features = [
    {
      icon: <Globe className="w-8 h-8 text-travel-ocean" />,
      title: "AI-Powered Planning",
      description: "Smart travel recommendations tailored to your preferences and budget"
    },
    {
      icon: <MapPin className="w-8 h-8 text-travel-sunset" />,
      title: "Real-time Guidance",
      description: "Live assistance throughout your journey with location-based insights"
    },
    {
      icon: <Users className="w-8 h-8 text-travel-forest" />,
      title: "Family-Friendly",
      description: "Manage travel plans for your entire family with ease"
    },
    {
      icon: <Shield className="w-8 h-8 text-travel-gold" />,
      title: "24/7 SOS Support",
      description: "Emergency assistance and safety features wherever you go"
    }
  ];

  return (
    <div className="min-h-screen bg-hero-gradient relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-travel-sky/20 via-transparent to-travel-ocean/20"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-travel-sunset/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-travel-ocean/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      {/* Header */}
      <header className="relative z-10 px-6 py-8">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">TravelVerse</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
            <Button variant="outline" onClick={handleGetStarted}>
              Sign In
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            <h1 className="hero-title mb-8">
              Your AI Travel
              <br />
              Companion
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience intelligent travel planning with our AI-powered assistant. 
              From booking to exploration, we've got your journey covered.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
              <Button 
                size="lg" 
                className="btn-travel text-lg px-12 py-6 rounded-xl"
                onClick={handleGetStarted}
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="btn-travel-secondary text-lg px-12 py-6 rounded-xl"
              >
                Watch Demo
                <Plane className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 transition-all duration-1000 delay-300 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
            <div className="travel-card text-center">
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Happy Travelers</div>
            </div>
            <div className="travel-card text-center">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Countries Covered</div>
            </div>
            <div className="travel-card text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">AI Support</div>
            </div>
          </div>

          {/* Features Section */}
          <section id="features" className={`transition-all duration-1000 delay-500 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-16 text-foreground">
              Why Choose TravelVerse?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={`travel-card text-center hover:scale-105 transition-all duration-300 delay-${index * 100}`}
                >
                  <div className="mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className={`mt-24 transition-all duration-1000 delay-700 ${mounted ? 'animate-scale-in' : 'opacity-0'}`}>
            <div className="travel-card max-w-4xl mx-auto text-center bg-gradient-travel text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Travel Experience?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of travelers who trust TravelVerse for their adventures
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-12 py-6 rounded-xl bg-white text-travel-ocean hover:bg-white/90"
                onClick={handleGetStarted}
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">TravelVerse</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>© 2024 TravelVerse. All rights reserved.</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Always improving</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
