
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { realApiService } from '@/api/realApiService';

interface User {
  id: string;
  email: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  language: string;
  contact: string;
  preferredTravelMode: 'flight' | 'train' | 'bus' | 'any';
  travelDocuments: any;
  emergencyContact?: any;
  isOnboarded: boolean;
  preferences?: {
    budgetRange: {
      min: number;
      max: number;
    };
    travelStyle: 'budget' | 'comfort' | 'luxury';
    interests: string[];
    favoriteDestination?: string;
  };
}

interface FamilyMember extends Omit<User, 'email' | 'isOnboarded'> {
  relationship: string;
}

interface Trip {
  id: string;
  source: string;
  destination: string;
  budget: number;
  members: number;
  departureDate: string;
  returnDate: string;
  transportBooking?: any;
  hotelBooking?: any;
  status: 'planning' | 'booked' | 'active' | 'completed';
}

interface AppState {
  user: User | null;
  familyMembers: FamilyMember[];
  currentTrip: Trip | null;
  isLoading: boolean;
  error: string | null;
}

type AppAction = 
  | { type: 'SET_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_FAMILY_MEMBERS'; payload: FamilyMember[] }
  | { type: 'ADD_FAMILY_MEMBER'; payload: FamilyMember }
  | { type: 'SET_CURRENT_TRIP'; payload: Trip }
  | { type: 'UPDATE_TRIP'; payload: Partial<Trip> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

const initialState: AppState = {
  user: null,
  familyMembers: [],
  currentTrip: null,
  isLoading: false,
  error: null,
};

// Helper function to get initial state from localStorage
const getInitialState = (): AppState => {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  if (token && userData) {
    try {
      const user = JSON.parse(userData);
      return {
        ...initialState,
        user,
      };
    } catch (error) {
      console.error('Failed to parse user data from localStorage:', error);
      localStorage.removeItem('userData');
    }
  }
  
  return initialState;
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  console.log('AppContext - Reducer action:', action.type, 'payload:', 'payload' in action ? action.payload : 'none');
  
  switch (action.type) {
    case 'SET_USER':
      // Store user data in localStorage when setting user
      if (action.payload) {
        console.log('AppContext - Storing user data in localStorage:', action.payload);
        localStorage.setItem('userData', JSON.stringify(action.payload));
      } else {
        console.log('AppContext - Clearing user data from localStorage');
        localStorage.removeItem('userData');
      }
      return { ...state, user: action.payload };
    case 'UPDATE_USER':
      const updatedUser = state.user ? { ...state.user, ...action.payload } : null;
      // Update localStorage when updating user
      if (updatedUser) {
        console.log('AppContext - Updating user data in localStorage:', updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      return { ...state, user: updatedUser };
    case 'SET_FAMILY_MEMBERS':
      return { ...state, familyMembers: action.payload };
    case 'ADD_FAMILY_MEMBER':
      return { ...state, familyMembers: [...state.familyMembers, action.payload] };
    case 'SET_CURRENT_TRIP':
      return { ...state, currentTrip: action.payload };
    case 'UPDATE_TRIP':
      return { 
        ...state, 
        currentTrip: state.currentTrip ? { ...state.currentTrip, ...action.payload } : null 
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOGOUT':
      // Clear localStorage on logout
      console.log('AppContext - Logging out, clearing localStorage');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      return initialState;
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  initializeUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: () => boolean;
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, getInitialState());

  // Check if user is authenticated
  const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('authToken');
    return !!(token && state.user);
  };

  // Initialize user data from API if token exists
  const initializeUser = async () => {
    const token = localStorage.getItem('authToken');
    console.log('AppContext - Initializing user, token exists:', !!token);
    
    if (token && !state.user) {
      try {
        console.log('AppContext - Fetching user profile from API...');
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await realApiService.getUserProfile();
        console.log('AppContext - API response:', response);
        
        if (response.success && response.data) {
          console.log('AppContext - Setting user data:', response.data);
          dispatch({ type: 'SET_USER', payload: response.data });
        } else {
          console.log('AppContext - API response not successful:', response);
        }
      } catch (error: any) {
        console.error('AppContext - Failed to initialize user:', error);
        // Clear invalid token
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        // If it's an authentication error (401), clear the state
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          console.log('AppContext - Authentication error, logging out');
          dispatch({ type: 'LOGOUT' });
        }
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      console.log('AppContext - No token or user already exists, skipping initialization');
    }
  };

  // Refresh user data from API
  const refreshUser = async () => {
    const token = localStorage.getItem('authToken');
    console.log('AppContext - Refreshing user, token exists:', !!token);
    
    if (token) {
      try {
        console.log('AppContext - Refreshing user profile from API...');
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await realApiService.getUserProfile();
        console.log('AppContext - Refresh API response:', response);
        
        if (response.success && response.data) {
          console.log('AppContext - Updating user data:', response.data);
          dispatch({ type: 'SET_USER', payload: response.data });
        } else {
          console.log('AppContext - Refresh API response not successful:', response);
        }
      } catch (error: any) {
        console.error('AppContext - Failed to refresh user:', error);
        // Clear invalid token
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        // If it's an authentication error (401), clear the state
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          console.log('AppContext - Authentication error during refresh, logging out');
          dispatch({ type: 'LOGOUT' });
        }
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      console.log('AppContext - No token found during refresh');
    }
  };

  // Initialize user data on mount if token exists
  useEffect(() => {
    initializeUser();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, initializeUser, refreshUser, isAuthenticated }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
