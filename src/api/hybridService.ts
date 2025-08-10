// Hybrid Service - Combines Mock Data (for prototype) with Real API (for functionality)
// This allows you to demonstrate the app with mock data while having real backend connectivity

import { aiService } from './aiService';
import { realApiService } from './realApiService';

// Configuration to control which service to use
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true' || true;

class HybridService {
  private static instance: HybridService;

  static getInstance(): HybridService {
    if (!HybridService.instance) {
      HybridService.instance = new HybridService();
    }
    return HybridService.instance;
  }

  // Helper method to log which service is being used
  private logServiceUsage(service: 'mock' | 'real', method: string) {
    console.log(`🔀 HybridService: Using ${service} service for ${method}`);
  }

  // Authentication Methods
  async login(email: string, password: string) {
    if (USE_REAL_API) {
      try {
        this.logServiceUsage('real', 'login');
        return await realApiService.login(email, password);
      } catch (error) {
        console.log('Real API failed, falling back to mock');
        this.logServiceUsage('mock', 'login');
        // Simulate mock login
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          data: { token: 'mock-token-123', user: { id: '1', email, name: 'Demo User' } }
        };
      }
    } else {
      this.logServiceUsage('mock', 'login');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        data: { token: 'mock-token-123', user: { id: '1', email, name: 'Demo User' } }
      };
    }
  }

  async signup(userData: { name: string; email: string; password: string; phone?: string }) {
    if (USE_REAL_API) {
      try {
        this.logServiceUsage('real', 'signup');
        return await realApiService.signup(userData);
      } catch (error) {
        console.log('Real API failed, falling back to mock');
        this.logServiceUsage('mock', 'signup');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          data: { token: 'mock-token-123', user: { id: '1', ...userData } }
        };
      }
    } else {
      this.logServiceUsage('mock', 'signup');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        data: { token: 'mock-token-123', user: { id: '1', ...userData } }
      };
    }
  }

  // Trip Methods - Combine mock AI suggestions with real backend storage
  async createTrip(tripData: any) {
    if (USE_REAL_API) {
      try {
        this.logServiceUsage('real', 'createTrip');
        const result = await realApiService.createTrip(tripData);
        
        // Also get AI suggestions for the trip
        if (USE_MOCK_DATA) {
          const aiSuggestions = await aiService.generateItinerary(
            tripData.destination, 
            Math.ceil((new Date(tripData.returnDate) - new Date(tripData.departureDate)) / (1000 * 60 * 60 * 24)),
            tripData.budget
          );
          return { ...result, aiSuggestions };
        }
        
        return result;
      } catch (error) {
        console.log('Real API failed, using mock only');
        this.logServiceUsage('mock', 'createTrip');
        return {
          success: true,
          data: { trip: { id: 'mock-trip-1', ...tripData } }
        };
      }
    } else {
      this.logServiceUsage('mock', 'createTrip');
      return {
        success: true,
        data: { trip: { id: 'mock-trip-1', ...tripData } }
      };
    }
  }

  async getTrips(params?: any) {
    if (USE_REAL_API) {
      try {
        this.logServiceUsage('real', 'getTrips');
        return await realApiService.getTrips(params);
      } catch (error) {
        console.log('Real API failed, using mock data');
        this.logServiceUsage('mock', 'getTrips');
        // Return mock trip data
        return {
          success: true,
          data: {
            trips: [
              {
                id: 'mock-1',
                title: 'Dubai Adventure',
                source: 'Chennai',
                destination: 'Dubai',
                budget: 50000,
                members: 2,
                departureDate: '2024-03-15',
                returnDate: '2024-03-20',
                status: 'planned'
              }
            ],
            pagination: { currentPage: 1, totalPages: 1, totalTrips: 1 }
          }
        };
      }
    } else {
      this.logServiceUsage('mock', 'getTrips');
      return {
        success: true,
        data: {
          trips: [
            {
              id: 'mock-1',
              title: 'Dubai Adventure',
              source: 'Chennai',
              destination: 'Dubai',
              budget: 50000,
              members: 2,
              departureDate: '2024-03-15',
              returnDate: '2024-03-20',
              status: 'planned'
            }
          ],
          pagination: { currentPage: 1, totalPages: 1, totalTrips: 1 }
        }
      };
    }
  }

  // Transport Methods - Combine mock AI suggestions with real backend
  async getTransportOptions(params: any) {
    if (USE_REAL_API) {
      try {
        this.logServiceUsage('real', 'getTransportOptions');
        const result = await realApiService.getTransportOptions(params);
        
        // Enhance with AI suggestions if mock data is enabled
        if (USE_MOCK_DATA) {
          const aiFlights = await aiService.generateFlightOptions(
            params.source, 
            params.destination, 
            params.budget || 50000, 
            params.passengers
          );
          return { ...result, aiSuggestions: aiFlights };
        }
        
        return result;
      } catch (error) {
        console.log('Real API failed, using mock data');
        this.logServiceUsage('mock', 'getTransportOptions');
        return await aiService.generateFlightOptions(
          params.source, 
          params.destination, 
          params.budget || 50000, 
          params.passengers
        );
      }
    } else {
      this.logServiceUsage('mock', 'getTransportOptions');
      return await aiService.generateFlightOptions(
        params.source, 
        params.destination, 
        params.budget || 50000, 
        params.passengers
      );
    }
  }

  // Hotel Methods - Combine mock AI suggestions with real backend
  async getHotelOptions(params: any) {
    if (USE_REAL_API) {
      try {
        this.logServiceUsage('real', 'getHotelOptions');
        const result = await realApiService.getHotelOptions(params);
        
        // Enhance with AI suggestions if mock data is enabled
        if (USE_MOCK_DATA) {
          const aiHotels = await aiService.generateHotelOptions(
            params.destination, 
            params.budget || 50000, 
            params.guests
          );
          return { ...result, aiSuggestions: aiHotels };
        }
        
        return result;
      } catch (error) {
        console.log('Real API failed, using mock data');
        this.logServiceUsage('mock', 'getHotelOptions');
        return await aiService.generateHotelOptions(
          params.destination, 
          params.budget || 50000, 
          params.guests
        );
      }
    } else {
      this.logServiceUsage('mock', 'getHotelOptions');
      return await aiService.generateHotelOptions(
        params.destination, 
        params.budget || 50000, 
        params.guests
      );
    }
  }

  // Dashboard Methods
  async getDashboardStats() {
    if (USE_REAL_API) {
      try {
        this.logServiceUsage('real', 'getDashboardStats');
        return await realApiService.getDashboardStats();
      } catch (error) {
        console.log('Real API failed, using mock data');
        this.logServiceUsage('mock', 'getDashboardStats');
        return {
          success: true,
          data: {
            totalTrips: 5,
            activeTrips: 2,
            totalSpent: 150000,
            upcomingTrips: 3
          }
        };
      }
    } else {
      this.logServiceUsage('mock', 'getDashboardStats');
      return {
        success: true,
        data: {
          totalTrips: 5,
          activeTrips: 2,
          totalSpent: 150000,
          upcomingTrips: 3
        }
      };
    }
  }

  // AI Chat Methods - Always use mock for prototype
  async chatResponse(message: string, context?: any) {
    this.logServiceUsage('mock', 'chatResponse');
    return await aiService.chatResponse(message, context);
  }

  async parseTravelPrompt(prompt: string) {
    this.logServiceUsage('mock', 'parseTravelPrompt');
    return await aiService.parseTravelPrompt(prompt);
  }

  // Utility method to check which services are available
  getServiceStatus() {
    return {
      mockData: USE_MOCK_DATA,
      realAPI: USE_REAL_API,
      backendConnected: USE_REAL_API,
      prototypeMode: USE_MOCK_DATA
    };
  }
}

export const hybridService = HybridService.getInstance();
