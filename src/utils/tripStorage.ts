import { SavedTrip, TripMemory } from '../types';

const STORAGE_KEY = 'TRIPTALE_SAVED_TRIPS_V1';

const SAMPLE_INITIAL_TRIP: SavedTrip = {
  id: 'trip-sample-goa-2026',
  customName: 'Goa Coastal & Heritage Retreat 2026',
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  startLocation: 'Mumbai',
  destination: 'Goa',
  travelers: 2,
  days: 4,
  travelDates: 'Nov 14 - 18, 2026',
  budgetTier: 'moderate',
  customBudget: 32000,
  selectedPreferences: ['Beaches & Coastal', 'Street Food & Local Dining', 'Heritage & History'],
  transportMode: 'car',
  transportDetails: {
    label: 'Car',
    distanceText: '585 km',
    durationText: '10 hr 30 min',
    estimatedCost: '₹6,500 (Fuel & Tolls)',
  },
  accommodationDetails: [
    { neighborhood: 'Candolim & Calangute Coastal Belt', vibe: 'Beachside boutique stay', estimatedCostNight: '₹4,500 / night' },
    { neighborhood: 'Fontainhas (Latin Quarter, Panaji)', vibe: 'Colonial heritage Portuguese villa', estimatedCostNight: '₹5,000 / night' },
  ],
  dailyItinerary: [
    {
      dayNumber: 1,
      theme: 'Arrival, Candolim Beach & Sunsets',
      morning: 'Arrive at North Goa, check into hotel and unpack.',
      afternoon: 'Stroll along Candolim beach and sip fresh coconut water.',
      evening: 'Golden hour sunset at Sinquerim fort overlooking the Arabian Sea.',
      foodSpot: 'Fisherman’s Wharf for authentic Goan Fish Curry and Pao.',
      travelNote: 'Rent a scooter for effortless local hopping.',
    },
    {
      dayNumber: 2,
      theme: 'Fontainhas Latin Quarter & Old Goa Churches',
      morning: 'Explore Basilicas of Bom Jesus and Se Cathedral in Old Goa.',
      afternoon: 'Walking photography tour through colorful narrow alleys of Fontainhas.',
      evening: 'Mandovi river sunset cruise with Goan folk music.',
      foodSpot: 'Viva Panjim for traditional Prawn Balchão and Bebinca.',
      travelNote: 'Respect church dress codes (shoulders & knees covered).',
    },
    {
      dayNumber: 3,
      theme: 'Spice Plantation Tour & Anjuna Flea Market',
      morning: 'Aromatic Sahakari Spice Plantation tour with organic buffet lunch.',
      afternoon: 'Boutique cafe hopping and flea market exploration in Anjuna.',
      evening: 'Seaside dining at Vagator cliffs with live acoustic tunes.',
      foodSpot: 'Curlies / Thalassa for Mediterranean delicacies with sea breeze.',
      travelNote: 'Buy fresh organic vanilla and cardamom from plantation shop.',
    },
    {
      dayNumber: 4,
      theme: 'South Goa Serenity & Palolem Beach',
      morning: 'Scenic drive to peaceful Palolem beach in South Goa.',
      afternoon: 'Kayak to Butterfly Island and relax in shade of coconut groves.',
      evening: 'Candlelight dinner on the beach and departure preparation.',
      foodSpot: 'Dropadi Restaurant for grilled Kingfish and garlic butter naan.',
      travelNote: 'Pack extra dry clothes for kayaking.',
    },
  ],
  placesVisited: ['Candolim Beach', 'Fort Aguada', 'Fontainhas', 'Basilica of Bom Jesus', 'Palolem Beach'],
  activities: ['Coastal drive', 'Spice plantation walk', 'Sea kayaking', 'Heritage photography'],
  budgetBreakdown: {
    accommodation: 13500,
    food: 8000,
    transportation: 6500,
    activities: 3000,
    miscellaneous: 1500,
    total: 32500,
    costPerPerson: 16250,
    remainingBudget: -500,
    currency: '₹',
  },
  actualSpending: 31200,
  notes: 'Best highlights: Sunset at Sinquerim, waking up early in Fontainhas before the crowds, and the aromatic spice plantation lunch. Renting two-wheelers made travel very flexible.',
  memories: [
    {
      id: 'mem-1',
      photoUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      caption: 'Golden sunset over the palms in South Goa 🌅',
      date: '2026-11-15',
      locationTag: 'Palolem Beach, Goa',
    },
    {
      id: 'mem-2',
      photoUrl: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=800&q=80',
      caption: 'Colorful Portuguese colonial facades of Fontainhas Latin Quarter 🎨',
      date: '2026-11-16',
      locationTag: 'Fontainhas, Panaji',
    },
  ],
};

export function getSavedTrips(): SavedTrip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed default sample trip if first time visit
      localStorage.setItem(STORAGE_KEY, JSON.stringify([SAMPLE_INITIAL_TRIP]));
      return [SAMPLE_INITIAL_TRIP];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [SAMPLE_INITIAL_TRIP];
  } catch (err) {
    console.error('Failed to parse saved trips from localStorage:', err);
    return [SAMPLE_INITIAL_TRIP];
  }
}

export function getSavedTripById(id: string): SavedTrip | undefined {
  const trips = getSavedTrips();
  return trips.find((t) => t.id === id);
}

export function saveTrip(trip: SavedTrip): void {
  try {
    const trips = getSavedTrips();
    const existingIndex = trips.findIndex((t) => t.id === trip.id);
    let updatedTrips: SavedTrip[];
    if (existingIndex >= 0) {
      updatedTrips = [...trips];
      updatedTrips[existingIndex] = {
        ...trip,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updatedTrips = [
        {
          ...trip,
          createdAt: trip.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...trips,
      ];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrips));
  } catch (err) {
    console.error('Failed to save trip to localStorage:', err);
  }
}

export function deleteTrip(id: string): void {
  try {
    const trips = getSavedTrips();
    const filtered = trips.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete trip from localStorage:', err);
  }
}

export function duplicateTrip(id: string): SavedTrip | null {
  try {
    const trips = getSavedTrips();
    const original = trips.find((t) => t.id === id);
    if (!original) return null;

    const duplicated: SavedTrip = {
      ...original,
      id: `trip-${Date.now()}`,
      customName: `${original.customName} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      memories: [...(original.memories || [])],
    };

    saveTrip(duplicated);
    return duplicated;
  } catch (err) {
    console.error('Failed to duplicate trip:', err);
    return null;
  }
}

export function addTripMemory(
  tripId: string,
  memory: Omit<TripMemory, 'id'>
): TripMemory | null {
  try {
    const trips = getSavedTrips();
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return null;

    const newMemory: TripMemory = {
      ...memory,
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    };

    trip.memories = [newMemory, ...(trip.memories || [])];
    trip.updatedAt = new Date().toISOString();
    saveTrip(trip);
    return newMemory;
  } catch (err) {
    console.error('Failed to add trip memory:', err);
    return null;
  }
}

export function deleteTripMemory(tripId: string, memoryId: string): boolean {
  try {
    const trips = getSavedTrips();
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return false;

    trip.memories = (trip.memories || []).filter((m) => m.id !== memoryId);
    trip.updatedAt = new Date().toISOString();
    saveTrip(trip);
    return true;
  } catch (err) {
    console.error('Failed to delete trip memory:', err);
    return false;
  }
}

export function updateTripSpending(tripId: string, actualSpending: number): void {
  try {
    const trips = getSavedTrips();
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    trip.actualSpending = actualSpending;
    trip.updatedAt = new Date().toISOString();
    saveTrip(trip);
  } catch (err) {
    console.error('Failed to update trip spending:', err);
  }
}

export async function syncTripToCloudSql(trip: SavedTrip, token: string): Promise<boolean> {
  try {
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: trip.id,
        customName: trip.customName,
        startLocation: trip.startLocation,
        destination: trip.destination,
        travelers: trip.travelers,
        days: trip.days,
        travelDates: trip.travelDates,
        budgetTier: trip.budgetTier,
        customBudget: trip.customBudget,
        totalPlannedBudget: trip.totalPlannedBudget || trip.budgetBreakdown?.total,
        transportMode: trip.transportMode,
        planData: {
          placesVisited: trip.placesVisited,
          activities: trip.activities,
          dailyItinerary: trip.dailyItinerary,
          accommodationDetails: trip.accommodationDetails,
          budgetBreakdown: trip.budgetBreakdown,
          memories: trip.memories,
        },
        notes: trip.notes,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to sync trip to Cloud SQL:', err);
    return false;
  }
}

export async function deleteTripFromCloudSql(tripId: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/trips/${tripId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete trip from Cloud SQL:', err);
    return false;
  }
}

export async function fetchUserTripsFromCloudSql(token: string): Promise<SavedTrip[]> {
  try {
    const res = await fetch('/api/trips', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (data.success && Array.isArray(data.trips)) {
      return data.trips.map((row: any) => {
        let parsedPlan: any = {};
        if (row.plan_data) {
          try {
            parsedPlan = typeof row.plan_data === 'string' ? JSON.parse(row.plan_data) : row.plan_data;
          } catch (e) {
            console.warn('Failed to parse plan_data from db:', e);
          }
        }
        return {
          id: row.id,
          customName: row.custom_name,
          startLocation: row.start_location,
          destination: row.destination,
          travelers: row.travelers,
          days: row.days,
          travelDates: row.travel_dates,
          budgetTier: row.budget_tier,
          customBudget: row.custom_budget,
          totalPlannedBudget: row.total_planned_budget,
          transportMode: row.transport_mode,
          notes: row.notes,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          placesVisited: parsedPlan.placesVisited || [],
          activities: parsedPlan.activities || [],
          dailyItinerary: parsedPlan.dailyItinerary || [],
          accommodationDetails: parsedPlan.accommodationDetails || [],
          budgetBreakdown: parsedPlan.budgetBreakdown,
          memories: parsedPlan.memories || [],
        };
      });
    }
    return [];
  } catch (err) {
    console.warn('Failed to fetch user trips from Cloud SQL:', err);
    return [];
  }
}
