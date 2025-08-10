// Real API Service for Backend Communication
// This service handles actual API calls to your backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class RealApiService {
  private static instance: RealApiService;

  static getInstance(): RealApiService {
    if (!RealApiService.instance) {
      RealApiService.instance = new RealApiService();
    }
    return RealApiService.instance;
  }

  // Generic API call method
  private async apiCall(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Call Error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server not responding');
      }
      throw error;
    }
  }

  // Authentication APIs
  async login(email: string, password: string) {
    return this.apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    return this.apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        fullName: userData.name,
        contact: userData.phone
      }),
    });
  }

  async completeOnboarding(onboardingData: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    language: string;
    contact: string;
    preferredTravelMode: string;
    travelDocuments: any;
    emergencyContact: any;
  }) {
    return this.apiCall('/auth/onboarding', {
      method: 'POST',
      body: JSON.stringify(onboardingData),
    });
  }

  async forgotPassword(email: string) {
    return this.apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Trip APIs
  async getTrips(params?: {
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    
    const endpoint = `/trips${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiCall(endpoint);
  }

  async getTrip(id: string) {
    return this.apiCall(`/trips/${id}`);
  }

  async createTrip(tripData: {
    title: string;
    source: string;
    destination: string;
    budget: number;
    members: number;
    departureDate: string;
    returnDate: string;
    notes?: string;
    tags?: string[];
  }) {
    return this.apiCall('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  async updateTrip(id: string, tripData: Partial<{
    title: string;
    source: string;
    destination: string;
    budget: number;
    members: number;
    departureDate: string;
    returnDate: string;
    notes: string;
    tags: string[];
    status: string;
  }>) {
    return this.apiCall(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tripData),
    });
  }

  async deleteTrip(id: string) {
    return this.apiCall(`/trips/${id}`, {
      method: 'DELETE',
    });
  }

  // Transport APIs
  async getTransportOptions(params: {
    source: string;
    destination: string;
    date: string;
    passengers: number;
    type?: 'flight' | 'train' | 'bus';
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return this.apiCall(`/transport/search?${queryParams.toString()}`);
  }

  async bookTransport(bookingData: {
    transportId: string;
    passengers: number;
    date: string;
    tripId?: string;
  }) {
    return this.apiCall('/transport/book', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  // Hotel APIs
  async getHotelOptions(params: {
    destination: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return this.apiCall(`/hotels/search?${queryParams.toString()}`);
  }

  async bookHotel(bookingData: {
    hotelId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    tripId?: string;
  }) {
    return this.apiCall('/hotels/book', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  // Dashboard APIs
  async getDashboardStats() {
    return this.apiCall('/dashboard/stats');
  }

  async getUpcomingTrips() {
    return this.apiCall('/dashboard/upcoming');
  }

  async getRecentBookings() {
    return this.apiCall('/dashboard/bookings');
  }

  // User Profile APIs
  async getUserProfile() {
    return this.apiCall('/users/profile');
  }

  async updateUserProfile(profileData: {
    name?: string;
    phone?: string;
    preferences?: any;
  }) {
    return this.apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Family Members APIs
  async getFamilyMembers() {
    return this.apiCall('/users/family-members');
  }

  async addFamilyMember(memberData: {
    name: string;
    relationship: string;
    age: number;
    passportNumber?: string;
  }) {
    return this.apiCall('/users/family-members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async addFamilyMembers(userId: string, familyMembers: any[]) {
    const promises = familyMembers.map(member => 
      this.apiCall(`/users/${userId}/family-members`, {
        method: 'POST',
        body: JSON.stringify({
          fullName: member.fullName,
          dateOfBirth: member.dateOfBirth,
          gender: member.gender,
          nationality: member.nationality,
          language: member.language,
          contact: member.contact,
          relationship: member.relationship,
          travelDocuments: member.travelDocuments
        }),
      })
    );
    
    return Promise.all(promises);
  }
}

export const realApiService = RealApiService.getInstance();
