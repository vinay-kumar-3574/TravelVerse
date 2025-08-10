
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Plane, MapPin, Calendar, Users } from 'lucide-react';

export const FloatingTravelIcons = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const icons = containerRef.current.children;
    
    // Create floating animation for travel icons
    Array.from(icons).forEach((icon, index) => {
      gsap.set(icon, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        opacity: 0.1 + Math.random() * 0.2
      });

      gsap.to(icon, {
        duration: 15 + Math.random() * 10,
        x: `+=${(Math.random() - 0.5) * 400}`,
        y: `+=${(Math.random() - 0.5) * 300}`,
        rotation: `+=${360 * (Math.random() > 0.5 ? 1 : -1)}`,
        ease: "none",
        repeat: -1,
        yoyo: true,
        delay: index * 0.5
      });
    });

  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <Plane className="absolute text-primary/20 w-8 h-8" />
      <MapPin className="absolute text-secondary/20 w-6 h-6" />
      <Calendar className="absolute text-accent/20 w-7 h-7" />
      <Users className="absolute text-muted-foreground/20 w-8 h-8" />
      <Plane className="absolute text-primary/20 w-10 h-10 rotate-45" />
      <MapPin className="absolute text-secondary/20 w-5 h-5" />
    </div>
  );
};

export const MessageAnimation = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    gsap.fromTo(elementRef.current, 
      { 
        opacity: 0, 
        y: 20, 
        scale: 0.95 
      },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.5, 
        delay,
        ease: "power2.out" 
      }
    );
  }, [delay]);

  return <div ref={elementRef}>{children}</div>;
};

export const PlaneAnimation = () => {
  const planeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!planeRef.current) return;

    gsap.to(planeRef.current, {
      duration: 8,
      x: window.innerWidth + 100,
      ease: "power1.inOut",
      repeat: -1,
      delay: 2
    });

    gsap.set(planeRef.current, {
      x: -100,
      y: 100
    });

  }, []);

  return (
    <div ref={planeRef} className="fixed pointer-events-none z-10">
      <Plane className="w-12 h-12 text-primary/30 rotate-45" />
    </div>
  );
};
