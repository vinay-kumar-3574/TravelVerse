
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

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

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };
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
      return initialState;
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
