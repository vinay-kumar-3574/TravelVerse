
// Mock AI Service - simulates OpenAI API calls
class AIService {
  private static instance: AIService;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Mock OpenAI API call
  private async mockOpenAICall(prompt: string, context?: any): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Mock intelligent responses based on context
    if (prompt.includes('travel') || prompt.includes('trip')) {
      return this.generateTravelResponse(prompt, context);
    }
    
    if (prompt.includes('hotel') || prompt.includes('accommodation')) {
      return this.generateHotelResponse(prompt, context);
    }
    
    if (prompt.includes('budget') || prompt.includes('cost')) {
      return this.generateBudgetResponse(prompt, context);
    }
    
    return "I'm here to help you plan your perfect trip! Tell me about your destination, budget, and travel preferences.";
  }

  private generateTravelResponse(prompt: string, context?: any): string {
    const responses = [
      `## ✈️ Travel Planning Complete!

Based on your requirements, I've analyzed your travel preferences and found excellent options for your journey.

**Key Highlights:**
- 🎯 **Personalized Recommendations** based on your budget and preferences
- 🚀 **Optimized Routes** for the best travel experience
- 💰 **Budget-Friendly Options** that don't compromise on quality

Let me show you the best transportation options and help you plan the perfect itinerary!`,
      
      `## 🌟 Excellent Travel Choice!

I've processed your travel request and found several fantastic options that match your criteria perfectly.

**What I Found:**
- 🚄 **Multiple Transport Options** from budget to premium
- 🏨 **Accommodation Suggestions** in prime locations
- 📅 **Flexible Scheduling** to fit your timeline
- 💡 **Local Insights** for an authentic experience

Ready to explore your personalized travel options?`,
      
      `## 🎉 Travel Analysis Complete!

Your travel preferences have been carefully analyzed, and I'm excited to share the results!

**Analysis Summary:**
- 📍 **Route Optimization** for the most efficient journey
- 🎯 **Budget Allocation** across all travel components
- 👥 **Group Accommodations** tailored to your party size
- 🌍 **Local Recommendations** for authentic experiences

Let's start building your perfect trip!`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateHotelResponse(prompt: string, context?: any): string {
    const responses = [
      `## 🏨 Hotel Recommendations Ready!

I've found some amazing accommodations that perfectly match your preferences and budget.

**Top Picks Include:**
- 🌟 **Luxury Options** with premium amenities
- 💰 **Budget-Friendly** choices with great value
- 📍 **Prime Locations** close to major attractions
- 🎯 **Family-Friendly** accommodations for group travel

Each hotel has been carefully selected based on your specific requirements!`,
      
      `## 🎯 Perfect Hotel Matches!

Based on your destination and preferences, here are my top hotel recommendations:

**Selection Criteria:**
- ⭐ **High Ratings** from verified guests
- 💎 **Value for Money** within your budget range
- 🚶 **Walkable Distance** to key attractions
- 🍽️ **Dining Options** and local cuisine access

Let me show you the details and help you make the best choice!`,
      
      `## 🏡 Accommodation Options Found!

These carefully selected hotels offer the best combination of comfort, location, and value:

**What Makes Them Special:**
- 🎨 **Unique Character** and local charm
- 🛏️ **Comfortable Rooms** with modern amenities
- 🌅 **Great Views** and peaceful surroundings
- 🚗 **Easy Access** to transportation hubs

Ready to see the full details and book your stay?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateBudgetResponse(prompt: string, context?: any): string {
    const responses = [
      `## 💰 Budget Analysis Complete!

I've analyzed your budget and created an optimized spending plan that covers all your travel needs.

**Budget Breakdown:**
- 🚗 **Transportation:** 40% - Flights, trains, local transport
- 🏨 **Accommodation:** 30% - Hotels, resorts, or rentals
- 🍽️ **Food & Dining:** 20% - Local restaurants and cuisine
- 🎯 **Activities:** 10% - Tours, attractions, experiences

**Smart Tips:**
- 💡 Book early for better rates
- 🎯 Use local transport to save money
- 🍽️ Try street food for authentic flavors
- 📱 Use travel apps for discounts`,
      
      `## 💎 Budget Optimization Success!

Your budget allocation looks excellent! I've distributed it strategically across all travel components.

**Allocation Strategy:**
- ✈️ **Air Travel:** Premium routes within budget
- 🏨 **Lodging:** Comfortable stays in prime areas
- 🚌 **Local Transport:** Efficient and cost-effective options
- 🎭 **Experiences:** Must-see attractions included

**Money-Saving Tips:**
- 🕐 **Off-Peak Travel** for better rates
- 🎫 **Combo Tickets** for multiple attractions
- 🏪 **Local Markets** for authentic shopping
- 🚶 **Walking Tours** for free exploration`,
      
      `## 🎯 Budget-Friendly Options Found!

Based on your budget, I can suggest several cost-effective options that don't compromise on quality.

**Value Propositions:**
- 💰 **Affordable Luxury** within your price range
- 🎯 **Strategic Timing** for best deals
- 🌟 **Hidden Gems** that offer great value
- 🚀 **Efficient Planning** to maximize your budget

**Smart Spending:**
- 📅 **Flexible Dates** for better rates
- 🏨 **Alternative Areas** with great value
- 🍽️ **Local Eateries** for authentic cuisine
- 🎫 **Free Activities** in your destination`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async parseTravelPrompt(prompt: string) {
    console.log('🤖 AI: Parsing travel prompt:', prompt);
    
    // Enhanced parsing with better pattern matching
    const parsed = {
      source: this.extractSource(prompt),
      destination: this.extractDestination(prompt),
      budget: this.extractBudget(prompt),
      members: this.extractMembers(prompt),
      dates: this.extractDates(prompt),
      preferences: this.extractPreferences(prompt),
      missingParams: [] as string[]
    };

    // Check for missing required parameters with better validation
    if (!parsed.source || parsed.source.trim() === '') {
      parsed.missingParams.push('source');
    }
    if (!parsed.destination || parsed.destination.trim() === '') {
      parsed.missingParams.push('destination');
    }
    if (!parsed.budget || parsed.budget <= 0) {
      parsed.missingParams.push('budget');
    }
    if (!parsed.members || parsed.members <= 0) {
      parsed.missingParams.push('members');
    }

    console.log('🧠 AI Parsed:', parsed);
    return parsed;
  }

  private extractSource(prompt: string): string {
    // Enhanced source patterns with more natural language support
    const sourcePatterns = [
      /from\s+([A-Za-z\s]+?)(?:\s+to|\s+with|\s+for|\s+₹|\s+\d+)/i,
      /leaving\s+([A-Za-z\s]+?)(?:\s+to|\s+with|\s+for|\s+₹|\s+\d+)/i,
      /starting\s+from\s+([A-Za-z\s]+?)(?:\s+to|\s+with|\s+for|\s+₹|\s+\d+)/i,
      /departing\s+from\s+([A-Za-z\s]+?)(?:\s+to|\s+with|\s+for|\s+₹|\s+\d+)/i,
      /I\s+(?:am\s+)?(?:in|at)\s+([A-Za-z\s]+?)(?:\s+and|\s+want|\s+planning|\s+thinking)/i,
      /currently\s+in\s+([A-Za-z\s]+?)(?:\s+and|\s+want|\s+planning|\s+thinking)/i
    ];

    for (const pattern of sourcePatterns) {
      const match = prompt.match(pattern);
      if (match) {
        const source = match[1].trim();
        // Validate that it's not just a common word
        if (source.length > 2 && !['the', 'and', 'or', 'but', 'for', 'with'].includes(source.toLowerCase())) {
          return source;
        }
      }
    }

    // Fallback: look for city names in the first part of the sentence
    const cities = ['Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'London', 'Paris', 'New York', 'Tokyo', 'Singapore', 'Dubai', 'Bangkok', 'Sydney', 'Toronto', 'Berlin', 'Amsterdam', 'Rome', 'Madrid', 'Vienna', 'Prague', 'Budapest', 'Warsaw', 'Stockholm', 'Oslo', 'Copenhagen', 'Helsinki'];
    const words = prompt.split(/\s+/);
    
    for (let i = 0; i < Math.min(8, words.length); i++) {
      for (const city of cities) {
        if (words[i].toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(words[i].toLowerCase())) {
          return city;
        }
      }
    }

    return '';
  }

  private extractDestination(prompt: string): string {
    // Enhanced destination patterns with more natural language support
    const destinationPatterns = [
      /to\s+([A-Za-z\s]+?)(?:\s+with|\s+for|\s+₹|\s+\d+)/i,
      /going\s+to\s+([A-Za-z\s]+?)(?:\s+with|\s+for|\s+₹|\s+\d+)/i,
      /visiting\s+([A-Za-z\s]+?)(?:\s+with|\s+for|\s+₹|\s+\d+)/i,
      /travelling\s+to\s+([A-Za-z\s]+?)(?:\s+with|\s+for|\s+₹|\s+\d+)/i,
      /want\s+to\s+go\s+to\s+([A-Za-z\s]+?)(?:\s+with|\s+for|\s+₹|\s+\d+)/i,
      /planning\s+to\s+visit\s+([A-Za-z\s]+?)(?:\s+with|\s+for|\s+₹|\s+\d+)/i,
      /dream\s+destination\s+([A-Za-z\s]+?)(?:\s+with|\s+for|\s+₹|\s+\d+)/i
    ];

    for (const pattern of destinationPatterns) {
      const match = prompt.match(pattern);
      if (match) {
        const destination = match[1].trim();
        // Validate that it's not just a common word
        if (destination.length > 2 && !['the', 'and', 'or', 'but', 'for', 'with'].includes(destination.toLowerCase())) {
          return destination;
        }
      }
    }

    // Fallback: look for city names after "to" or similar words
    const cities = ['Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'London', 'Paris', 'New York', 'Tokyo', 'Singapore', 'Dubai', 'Bangkok', 'Sydney', 'Toronto', 'Berlin', 'Amsterdam', 'Rome', 'Madrid', 'Vienna', 'Prague', 'Budapest', 'Warsaw', 'Stockholm', 'Oslo', 'Copenhagen', 'Helsinki'];
    const words = prompt.split(/\s+/);
    
    for (let i = 0; i < words.length - 1; i++) {
      if (['to', 'going', 'visiting', 'visit', 'see', 'explore'].includes(words[i].toLowerCase())) {
        for (const city of cities) {
          if (words[i + 1].toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(words[i + 1].toLowerCase())) {
            return city;
          }
        }
      }
    }

    return '';
  }

  private extractBudget(prompt: string): number {
    // Enhanced budget extraction with multiple patterns and better validation
    const budgetPatterns = [
      /₹\s*(\d+(?:,\d+)*)/i,
      /(\d+(?:,\d+)*)\s*₹/i,
      /(\d+(?:,\d+)*)\s*(?:rupees?|rs|inr)/i,
      /budget\s+(?:of\s+)?(?:₹\s*)?(\d+(?:,\d+)*)/i,
      /with\s+(?:₹\s*)?(\d+(?:,\d+)*)\s*(?:budget|rupees?|rs|inr)/i,
      /(\d+(?:,\d+)*)\s*(?:budget|rupees?|rs|inr)/i,
      /around\s+(?:₹\s*)?(\d+(?:,\d+)*)/i,
      /approximately\s+(?:₹\s*)?(\d+(?:,\d+)*)/i,
      /about\s+(?:₹\s*)?(\d+(?:,\d+)*)/i,
      /(\d+(?:,\d+)*)\s*(?:k|thousand)/i,
      /(\d+)\s*k\s*(?:rupees?|rs|inr)/i
    ];

    for (const pattern of budgetPatterns) {
      const match = prompt.match(pattern);
      if (match) {
        let budget = match[1].replace(/,/g, '');
        // Handle 'k' notation (e.g., 50k = 50,000)
        if (budget.includes('k') || budget.includes('K')) {
          budget = budget.replace(/[kK]/g, '000');
        }
        const parsedBudget = parseInt(budget);
        if (parsedBudget >= 1000 && parsedBudget <= 1000000) {
          return parsedBudget;
        }
      }
    }

    // Look for numbers that could be budget (usually larger numbers)
    const numberMatches = prompt.match(/(\d{4,})/g);
    if (numberMatches) {
      // Filter out years and other non-budget numbers
      const potentialBudgets = numberMatches
        .map(num => parseInt(num))
        .filter(num => num >= 1000 && num <= 1000000); // Reasonable budget range
      
      if (potentialBudgets.length > 0) {
        // Return the largest potential budget, but validate it's reasonable
        const maxBudget = Math.max(...potentialBudgets);
        if (maxBudget >= 5000) { // Minimum reasonable budget
          return maxBudget;
        }
      }
    }

    return 0;
  }

  private extractMembers(prompt: string): number {
    // Enhanced member extraction with multiple patterns and better validation
    const memberPatterns = [
      /(\d+)\s*(?:people?|persons?|travelers?|members?|guests?|adults?|kids?|children)/i,
      /for\s+(\d+)\s*(?:people?|persons?|travelers?|members?|guests?|adults?|kids?|children)/i,
      /with\s+(\d+)\s*(?:people?|persons?|travelers?|members?|guests?|adults?|kids?|children)/i,
      /(\d+)\s*(?:people?|persons?|travelers?|members?|guests?|adults?|kids?|children)\s+(?:are|will|want|planning|going)/i,
      /group\s+of\s+(\d+)/i,
      /(\d+)\s*travelers?/i,
      /(\d+)\s*of\s+us/i,
      /we\s+are\s+(\d+)/i,
      /(\d+)\s*person\s+group/i,
      /family\s+of\s+(\d+)/i
    ];

    for (const pattern of memberPatterns) {
      const match = prompt.match(pattern);
      if (match) {
        const members = parseInt(match[1]);
        if (members >= 1 && members <= 20) { // Reasonable group size
          return members;
        }
      }
    }

    // Look for natural language indicators of group travel
    const groupIndicators = [
      /we\s+want\s+to\s+go/i,
      /we\s+are\s+planning/i,
      /we\s+are\s+thinking/i,
      /we\s+would\s+like/i,
      /our\s+family/i,
      /our\s+group/i,
      /my\s+family/i,
      /my\s+friends/i,
      /with\s+my\s+family/i,
      /with\s+my\s+friends/i,
      /together\s+with/i,
      /along\s+with/i
    ];

    for (const indicator of groupIndicators) {
      if (indicator.test(prompt)) {
        // Default to 2 for group indicators (minimum group size)
        return 2;
      }
    }

    // Look for numbers that could be member count (usually small numbers)
    const numberMatches = prompt.match(/(\d{1,2})/g);
    if (numberMatches) {
      const potentialMembers = numberMatches
        .map(num => parseInt(num))
        .filter(num => num >= 1 && num <= 20); // Reasonable group size
      
      if (potentialMembers.length > 0) {
        // If multiple numbers found, prefer the one that's not a budget
        const nonBudgetNumbers = potentialMembers.filter(num => num < 1000);
        if (nonBudgetNumbers.length > 0) {
          return nonBudgetNumbers[0];
        }
        return potentialMembers[0];
      }
    }

    return 0; // Changed from 1 to 0 to properly detect missing members
  }

  private extractDates(prompt: string): { departure?: string; return?: string } {
    // Mock date extraction
    return {};
  }

  private extractPreferences(prompt: string): string[] {
    const preferences = [];
    if (prompt.includes('luxury')) preferences.push('luxury');
    if (prompt.includes('budget')) preferences.push('budget');
    if (prompt.includes('family')) preferences.push('family-friendly');
    return preferences;
  }

  async generateFlightOptions(source: string, destination: string, budget: number, members: number) {
    console.log('✈️ AI: Generating flight options');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockFlights = [
      {
        id: 'FL001',
        airline: 'Air India',
        departure: '06:30',
        arrival: '09:45',
        duration: '3h 15m',
        price: Math.floor(budget * 0.4),
        class: 'Economy',
        stops: 0,
        aircraft: 'Boeing 737'
      },
      {
        id: 'FL002',
        airline: 'Emirates',
        departure: '14:20',
        arrival: '17:50',
        duration: '3h 30m',
        price: Math.floor(budget * 0.6),
        class: 'Business',
        stops: 0,
        aircraft: 'Airbus A380'
      },
      {
        id: 'FL003',
        airline: 'IndiGo',
        departure: '22:15',
        arrival: '01:40+1',
        duration: '3h 25m',
        price: Math.floor(budget * 0.3),
        class: 'Economy',
        stops: 0,
        aircraft: 'Airbus A320'
      }
    ];

    return mockFlights;
  }

  async generateHotelOptions(destination: string, budget: number, members: number) {
    console.log('🏨 AI: Generating hotel options');
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockHotels = [
      {
        id: 'HT001',
        name: 'Grand Palace Hotel',
        rating: 4.5,
        price: Math.floor(budget * 0.3),
        location: `Downtown ${destination}`,
        amenities: ['Pool', 'Spa', 'Gym', 'Restaurant'],
        image: '/placeholder.svg',
        distance: '2.1 km from center'
      },
      {
        id: 'HT002',
        name: 'Luxury Suites',
        rating: 4.8,
        price: Math.floor(budget * 0.5),
        location: `Central ${destination}`,
        amenities: ['Concierge', 'Room Service', 'Business Center'],
        image: '/placeholder.svg',
        distance: '0.8 km from center'
      },
      {
        id: 'HT003',
        name: 'Budget Inn',
        rating: 4.2,
        price: Math.floor(budget * 0.2),
        location: `${destination} Airport Area`,
        amenities: ['Free WiFi', 'Breakfast', 'Parking'],
        image: '/placeholder.svg',
        distance: '5.2 km from center'
      }
    ];

    return mockHotels;
  }

  async generateItinerary(destination: string, days: number, budget: number) {
    console.log('📅 AI: Generating itinerary');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockItinerary = Array.from({ length: days }, (_, index) => ({
      day: index + 1,
      title: `Day ${index + 1}: Explore ${destination}`,
      activities: [
        {
          time: '09:00',
          activity: 'Visit Local Museum',
          duration: '2 hours',
          cost: Math.floor(budget * 0.1)
        },
        {
          time: '12:00',
          activity: 'Lunch at Local Restaurant',
          duration: '1 hour',
          cost: Math.floor(budget * 0.05)
        },
        {
          time: '15:00',
          activity: 'City Walking Tour',
          duration: '3 hours',
          cost: Math.floor(budget * 0.08)
        }
      ]
    }));

    return mockItinerary;
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    console.log('🌐 AI: Translating text');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock translation responses
    const translations: { [key: string]: { [key: string]: string } } = {
      'es': {
        'Hello': 'Hola',
        'Thank you': 'Gracias',
        'Where is the hotel?': '¿Dónde está el hotel?'
      },
      'fr': {
        'Hello': 'Bonjour',
        'Thank you': 'Merci',
        'Where is the hotel?': 'Où est l\'hôtel?'
      },
      'hi': {
        'Hello': 'नमस्ते',
        'Thank you': 'धन्यवाद',
        'Where is the hotel?': 'होटल कहाँ है?'
      }
    };

    return translations[targetLanguage]?.[text] || `[Translated to ${targetLanguage}]: ${text}`;
  }

  async generateBudgetBreakdown(totalBudget: number, tripType: string) {
    console.log('💰 AI: Generating budget breakdown');
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      transportation: Math.floor(totalBudget * 0.4),
      accommodation: Math.floor(totalBudget * 0.3),
      food: Math.floor(totalBudget * 0.2),
      activities: Math.floor(totalBudget * 0.1),
      emergency: Math.floor(totalBudget * 0.05)
    };
  }

  async handleSOS(location: string, emergencyType: string) {
    console.log('🚨 AI: Handling SOS request');
    await new Promise(resolve => setTimeout(resolve, 500));

    const emergencyContacts = {
      police: '+1-911',
      ambulance: '+1-911',
      fire: '+1-911',
      embassy: '+1-555-0123'
    };

    return {
      message: `Emergency services contacted for ${emergencyType} at ${location}`,
      contacts: emergencyContacts,
      nearbyServices: [
        { name: 'City Hospital', distance: '1.2 km', phone: '+1-555-0100' },
        { name: 'Police Station', distance: '0.8 km', phone: '+1-555-0101' }
      ]
    };
  }

  async chatResponse(message: string, context?: any): Promise<string> {
    this.conversationHistory.push({ role: 'user', content: message });
    
    // Generate contextual responses based on message content
    let response = '';
    
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      response = `## 👋 Hello there!

Welcome to **TravelVerse AI** - your intelligent travel companion! 

**How can I help you today?**
- ✈️ **Plan a trip** - Tell me your destination and preferences
- 🏨 **Find accommodation** - Hotels, resorts, or unique stays
- 🚗 **Transport options** - Flights, trains, buses, or car rentals
- 💰 **Budget planning** - Optimize your travel spending
- 🌍 **Local insights** - Discover hidden gems and authentic experiences

Just describe what you're looking for, and I'll create a personalized travel plan for you!`;
    } else if (message.toLowerCase().includes('weather') || message.toLowerCase().includes('climate')) {
      response = `## 🌤️ Weather & Climate Information

I'd be happy to help you with weather information for your destination!

**What I can tell you:**
- 🌡️ **Temperature ranges** for different seasons
- ☔ **Rainfall patterns** and best time to visit
- 🌞 **Sunny days** and ideal outdoor activity periods
- 🧥 **Packing recommendations** based on weather

**To get specific weather info, please tell me:**
- 📍 **Destination city/country**
- 📅 **Travel dates** (if you have them)
- 🎯 **Activities** you're planning (beach, hiking, city tours, etc.)

This will help me provide the most accurate and useful weather information for your trip!`;
    } else if (message.toLowerCase().includes('food') || message.toLowerCase().includes('cuisine') || message.toLowerCase().includes('restaurant')) {
      response = `## 🍽️ Local Cuisine & Dining Guide

Great question! Local food is one of the best parts of traveling!

**What I can help you discover:**
- 🏆 **Must-try local dishes** and signature foods
- 🍜 **Popular restaurants** from street food to fine dining
- 🕐 **Best dining times** and local eating customs
- 💰 **Price ranges** for different dining experiences
- 🥘 **Dietary options** for various preferences

**To give you the best recommendations, tell me:**
- 🌍 **Your destination**
- 👥 **Group size** and preferences
- 💰 **Budget range** for meals
- 🍽️ **Cuisine preferences** (spicy, vegetarian, etc.)
- 🕐 **Meal times** you're interested in

Let's find the perfect places to satisfy your taste buds!`;
    } else {
      // Use the existing response generation
      response = await this.mockOpenAICall(message, context);
    }
    
    this.conversationHistory.push({ role: 'assistant', content: response });
    return response;
  }

  async generateMissingParamPrompt(missingParams: string[], partialData: any): Promise<string> {
    console.log('🤖 AI: Generating missing param prompt for:', missingParams);
    
    let prompt = `## 🔍 Almost there! I just need a few more details to plan your perfect trip!

I'm excited to help you create an amazing travel experience! Let me gather the missing information:`;

    // Show what we already know
    if (partialData.source && partialData.destination) {
      prompt += `\n\n📍 **Route:** ${partialData.source} → ${partialData.destination}`;
    }
    if (partialData.budget) {
      prompt += `\n💰 **Budget:** ₹${partialData.budget.toLocaleString()}`;
    }
    if (partialData.members) {
      prompt += `\n👥 **Travelers:** ${partialData.members}`;
    }

    prompt += `\n\n**Please tell me about:**\n`;

    missingParams.forEach((param, index) => {
      switch (param) {
        case 'source':
          prompt += `${index + 1}. 🚀 **Where are you traveling from?**\n`;
          prompt += `   💡 *Examples:* "I'm in Chennai", "Leaving from Mumbai", "Currently in Delhi"\n`;
          break;
        case 'destination':
          prompt += `${index + 1}. 🏖️ **Where do you want to go?**\n`;
          prompt += `   💡 *Examples:* "I want to visit Dubai", "Going to London", "Planning to see Paris"\n`;
          break;
        case 'budget':
          prompt += `${index + 1}. 💰 **What's your budget?**\n`;
          prompt += `   💡 *Examples:* "₹50,000", "Around 1 lakh", "Budget is 75k", "About 100 thousand"\n`;
          break;
        case 'members':
          prompt += `${index + 1}. 👥 **How many people are traveling?**\n`;
          prompt += `   💡 *Examples:* "We are 4 people", "Family of 6", "Just me and my friend", "Group of 8"\n`;
          break;
      }
    });

    prompt += `\n\n🎯 **Quick tip:** You can tell me everything at once! For example:\n`;
    prompt += `"*I want to go from Chennai to Dubai with 4 people and ₹50,000 budget*"\n\n`;
    
    prompt += `✨ **Or answer one by one** - I'm here to help make this easy for you!`;

    return prompt;
  }
}

export const aiService = AIService.getInstance();
