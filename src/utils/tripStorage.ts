import { SavedTrip, TripMemory } from '../types';

function getStorageKey(userId?: string | null): string {
  if (userId) {
    return `TRIPTALE_SAVED_TRIPS_V2_${userId}`;
  }
  return 'TRIPTALE_SAVED_TRIPS_V2_guest';
}

export function getSavedTrips(userId?: string | null): SavedTrip[] {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse saved trips from localStorage:', err);
    return [];
  }
}

export function getSavedTripById(id: string, userId?: string | null): SavedTrip | undefined {
  const trips = getSavedTrips(userId);
  return trips.find((t) => t.id === id);
}

export function saveTrip(trip: SavedTrip, userId?: string | null): void {
  try {
    const key = getStorageKey(userId);
    const trips = getSavedTrips(userId);
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
    localStorage.setItem(key, JSON.stringify(updatedTrips));
  } catch (err) {
    console.error('Failed to save trip to localStorage:', err);
  }
}

export function setSavedTrips(trips: SavedTrip[], userId?: string | null): void {
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(trips));
  } catch (err) {
    console.error('Failed to set saved trips in localStorage:', err);
  }
}

export function deleteTrip(id: string, userId?: string | null): void {
  try {
    const key = getStorageKey(userId);
    const trips = getSavedTrips(userId);
    const filtered = trips.filter((t) => t.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete trip from localStorage:', err);
  }
}

export function duplicateTrip(id: string, userId?: string | null): SavedTrip | null {
  try {
    const trips = getSavedTrips(userId);
    const original = trips.find((t) => t.id === id);
    if (!original) return null;

    const duplicated: SavedTrip = {
      ...original,
      id: `trip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      customName: `${original.customName} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      memories: [...(original.memories || [])],
    };

    saveTrip(duplicated, userId);
    return duplicated;
  } catch (err) {
    console.error('Failed to duplicate trip:', err);
    return null;
  }
}

export function addTripMemory(
  tripId: string,
  memory: Omit<TripMemory, 'id'>,
  userId?: string | null
): TripMemory | null {
  try {
    const trips = getSavedTrips(userId);
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return null;

    const newMemory: TripMemory = {
      ...memory,
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    trip.memories = [newMemory, ...(trip.memories || [])];
    trip.updatedAt = new Date().toISOString();
    saveTrip(trip, userId);
    return newMemory;
  } catch (err) {
    console.error('Failed to add trip memory:', err);
    return null;
  }
}

export function deleteTripMemory(
  tripId: string, 
  memoryId: string, 
  userId?: string | null
): boolean {
  try {
    const trips = getSavedTrips(userId);
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return false;

    trip.memories = (trip.memories || []).filter((m) => m.id !== memoryId);
    trip.updatedAt = new Date().toISOString();
    saveTrip(trip, userId);
    return true;
  } catch (err) {
    console.error('Failed to delete trip memory:', err);
    return false;
  }
}

export function updateTripSpending(
  tripId: string, 
  actualSpending: number, 
  userId?: string | null
): void {
  try {
    const trips = getSavedTrips(userId);
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    trip.actualSpending = actualSpending;
    trip.updatedAt = new Date().toISOString();
    saveTrip(trip, userId);
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
