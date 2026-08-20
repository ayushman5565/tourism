export type PageRoute =
  | 'home'
  | 'explore'
  | 'planner'
  | 'itinerary'
  | 'trip-history'
  | 'emergency'
  | 'assistant'
  | 'group-trips'
  | 'gallery'
  | 'features'
  | 'about'
  | 'auth';

export type DestinationCategory =
  | 'all'
  | 'heritage'
  | 'nature'
  | 'coastal'
  | 'mountains'
  | 'wellness'
  | 'culinary'
  | 'culture';

export interface TripMemory {
  id: string;
  photoUrl: string;
  caption: string;
  date: string;
  locationTag?: string;
  imageUrl?: string;
  location?: string;
  activity?: string;
}

export interface SavedTrip {
  id: string;
  customName: string;
  createdAt: string;
  updatedAt?: string;
  startLocation: string;
  destination: string;
  travelers: number;
  days: number;
  durationDays?: number;
  travelDates: string;
  budgetTier: 'budget' | 'moderate' | 'luxury' | 'custom';
  customBudget?: number;
  selectedPreferences?: string[];
  transportMode?: TransportMode;
  transportDetails?: {
    label: string;
    distanceText?: string;
    durationText?: string;
    estimatedCost?: string;
  };
  accommodationDetails?: {
    neighborhood?: string;
    vibe?: string;
    estimatedCostNight?: string;
  }[];
  dailyItinerary: DayItinerary[];
  placesVisited?: string[];
  activities?: string[];
  foodRecommendations?: string[];
  budgetBreakdown: BudgetBreakdown;
  totalPlannedBudget?: number;
  actualSpending?: number;
  notes?: string;
  memories: TripMemory[];
}

export interface EmergencyContact {
  id: string;
  number: string;
  name: string;
  category: 'police' | 'ambulance' | 'women_safety' | 'highway' | 'general' | 'transit';
  description: string;
  hours: string;
  isPrimary?: boolean;
  tollFree?: boolean;
}

export interface TouristAttraction {
  id: string;
  name: string;
  category: 'Heritage' | 'Nature' | 'Culture' | 'Culinary' | 'Viewpoint' | 'Leisure' | 'Coastal' | 'Attraction';
  description: string;
  recommendedDuration: string; // e.g., "1.5 hours"
  bestTimeToVisit: string; // e.g., "Early morning 8:30 AM"
  estimatedEntryFee: string; // e.g., "₹1,500" or "Free"
  lat: number;
  lng: number;
  travelTip?: string;
  image?: string;
  photoReference?: string;
}

export interface DayItinerary {
  dayNumber: number;
  theme: string;
  morning: string;
  afternoon: string;
  evening: string;
  foodSpot: string;
  travelNote: string;
  attractionIds?: string[];
}

export interface DestinationDetail {
  id: string;
  name: string;
  country: string;
  stateOrRegion: string;
  tagline: string;
  description: string;
  heroImage: string;
  galleryImages: string[];
  category: DestinationCategory;
  bestTimeToVisit: string;
  idealDuration: string; // e.g. "3 - 4 Days"
  estimatedDailyBudget: {
    budget: string;
    moderate: string;
    luxury: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  topAttractions: TouristAttraction[];
  sampleDays: DayItinerary[];
  localFood: {
    dish: string;
    description: string;
    icon?: string;
  }[];
  stayRecommendations: {
    area: string;
    ambience: string;
    priceRange: string;
  }[];
  practicalTips: {
    title: string;
    tip: string;
    type: 'safety' | 'transit' | 'culture' | 'packing';
  }[];
  nearbyPlaces: {
    name: string;
    distance: string;
    highlight: string;
  }[];
}

export interface RouteWaypoint {
  id: string;
  order: number;
  name: string;
  lat: number;
  lng: number;
  category: string;
  recommendedDuration: string;
  distanceFromPreviousKm?: number;
  travelTimeFromPreviousMin?: number;
  description: string;
  recommendedTime: string;
  image?: string;
}

export type TransportMode = 'car' | 'two_wheeler' | 'train' | 'flight' | 'bus';

export interface TransportOption {
  id: TransportMode;
  label: string;
  icon: string;
  distanceText: string;
  durationText: string;
  durationMinutes: number;
  distanceKm: number;
  estimatedCostRange: string;
  description: string;
}

export interface TripPlanResult {
  id: string;
  destination: string;
  startLocation: string;
  dates: string;
  travelers: number;
  interests: string[];
  budgetTier: 'budget' | 'moderate' | 'luxury';
  selectedTransport?: TransportOption;
  transportOptions?: TransportOption[];
  totalDistanceKm: number;
  totalEstimatedDriveTimeHours: number;
  overview: string;
  waypoints: RouteWaypoint[];
  dayWiseItinerary: DayItinerary[];
  foodRecommendations: {
    name: string;
    type: string;
    neighborhood: string;
    mustTry: string;
  }[];
  staySuggestions: {
    neighborhood: string;
    vibe: string;
    estimatedCostNight: string;
  }[];
  estimatedTotalBudget: {
    stay: number;
    food: number;
    transport: number;
    sightseeing: number;
    total: number;
    currency: string;
  };
  practicalAdvice: string[];
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  transportation: number;
  activities: number;
  miscellaneous: number;
  total: number;
  costPerPerson: number;
  remainingBudget: number;
  currency: string;
}

export interface GroupExpense {
  id: string;
  title: string;
  amount: number;
  paidBy: string; // The member name who incurred/paid this expense
  category?: 'Stay' | 'Food' | 'Transport' | 'Tickets' | 'Activities' | 'Other';
  date: string;
  splitAmong?: string[];
}

export interface DebtSettlement {
  from: string;
  to: string;
  amount: number;
}

export interface GroupMemberData {
  name: string;
  budget?: number | null; // Optional intended budget
}

export interface GroupTrip {
  id: string;
  name: string;
  destination: string;
  currency: string;
  members: string[]; // List of member names
  memberBudgets?: Record<string, number | null>; // memberName -> budget
  expenses: GroupExpense[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestedPrompts?: string[];
}

// SIMPLE SMART GALLERY TYPES (Organized by Place: Place Name + Photos + Small Note)
export interface GalleryPhoto {
  id: string;
  url: string;
  dateAdded: string;
  fileName?: string;
}

export interface SmartPlace {
  id: string;
  name: string; // e.g. "Nahan", "Solan", "Shimla"
  note?: string; // Small note e.g. "Beautiful mountain views and a peaceful stop."
  photos: GalleryPhoto[];
  createdAt: string;
}
