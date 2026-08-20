import { SavedTrip, TripMemory } from '../types';
import { supabase } from '../lib/supabase';

function getStorageKey(userId?: string | null): string {
  return userId ? `TRIPTALE_SAVED_TRIPS_V2_${userId}` : 'TRIPTALE_SAVED_TRIPS_V2_guest';
}

export function getSavedTrips(userId?: string | null): SavedTrip[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse saved trips from localStorage:', err);
    return [];
  }
}

export function getSavedTripById(id: string, userId?: string | null): SavedTrip | undefined {
  return getSavedTrips(userId).find((trip) => trip.id === id);
}

export function saveTrip(trip: SavedTrip, userId?: string | null): void {
  try {
    const trips = getSavedTrips(userId);
    const existingIndex = trips.findIndex((item) => item.id === trip.id);
    const savedTrip: SavedTrip = {
      ...trip,
      createdAt: trip.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedTrips = existingIndex >= 0
      ? trips.map((item, index) => index === existingIndex ? savedTrip : item)
      : [savedTrip, ...trips];
    localStorage.setItem(getStorageKey(userId), JSON.stringify(updatedTrips));
  } catch (err) {
    console.error('Failed to save trip to localStorage:', err);
  }
}

export function setSavedTrips(trips: SavedTrip[], userId?: string | null): void {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(trips));
  } catch (err) {
    console.error('Failed to set saved trips in localStorage:', err);
  }
}

export function deleteTrip(id: string, userId?: string | null): void {
  try {
    const trips = getSavedTrips(userId).filter((trip) => trip.id !== id);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(trips));
  } catch (err) {
    console.error('Failed to delete trip from localStorage:', err);
  }
}

export function duplicateTrip(id: string, userId?: string | null): SavedTrip | null {
  const original = getSavedTrips(userId).find((trip) => trip.id === id);
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
}

export function addTripMemory(
  tripId: string,
  memory: Omit<TripMemory, 'id'>,
  userId?: string | null
): TripMemory | null {
  const trip = getSavedTrips(userId).find((item) => item.id === tripId);
  if (!trip) return null;

  const newMemory: TripMemory = {
    ...memory,
    id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };
  saveTrip({ ...trip, memories: [newMemory, ...(trip.memories || [])] }, userId);
  return newMemory;
}

export function deleteTripMemory(tripId: string, memoryId: string, userId?: string | null): boolean {
  const trip = getSavedTrips(userId).find((item) => item.id === tripId);
  if (!trip) return false;

  saveTrip({ ...trip, memories: (trip.memories || []).filter((memory) => memory.id !== memoryId) }, userId);
  return true;
}

export function updateTripSpending(tripId: string, actualSpending: number, userId?: string | null): void {
  const trip = getSavedTrips(userId).find((item) => item.id === tripId);
  if (!trip) return;
  saveTrip({ ...trip, actualSpending }, userId);
}

function toSupabaseTrip(trip: SavedTrip, userId: string) {
  return {
    id: trip.id,
    user_id: userId,
    custom_name: trip.customName,
    start_location: trip.startLocation,
    destination: trip.destination,
    travelers: trip.travelers,
    days: trip.days,
    travel_dates: trip.travelDates,
    budget_tier: trip.budgetTier,
    custom_budget: trip.customBudget ?? null,
    total_planned_budget: trip.totalPlannedBudget ?? trip.budgetBreakdown?.total ?? null,
    transport_mode: trip.transportMode ?? null,
    // Preserve every UI-specific field without repeatedly changing the database
    // schema as itinerary features evolve.
    plan_data: trip,
    notes: trip.notes ?? null,
    actual_spending: trip.actualSpending ?? null,
  };
}

function fromSupabaseTrip(row: any): SavedTrip {
  const planData = row.plan_data && typeof row.plan_data === 'object' ? row.plan_data : {};
  return {
    ...planData,
    id: row.id,
    customName: row.custom_name,
    startLocation: row.start_location,
    destination: row.destination,
    travelers: row.travelers,
    days: row.days,
    travelDates: row.travel_dates || '',
    budgetTier: row.budget_tier || 'moderate',
    customBudget: row.custom_budget ?? undefined,
    totalPlannedBudget: row.total_planned_budget ?? undefined,
    transportMode: row.transport_mode ?? undefined,
    notes: row.notes ?? undefined,
    actualSpending: row.actual_spending ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    dailyItinerary: planData.dailyItinerary || [],
    budgetBreakdown: planData.budgetBreakdown || {
      accommodation: 0,
      food: 0,
      transportation: 0,
      activities: 0,
      miscellaneous: 0,
      total: 0,
      costPerPerson: 0,
      remainingBudget: 0,
      currency: 'INR',
    },
    memories: planData.memories || [],
  } as SavedTrip;
}

/** Syncs one locally saved trip to Supabase. RLS verifies user ownership. */
export async function syncTripToSupabase(trip: SavedTrip, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('trips')
    .upsert(toSupabaseTrip(trip, userId), { onConflict: 'id' });

  if (error) {
    console.warn('Failed to sync trip to Supabase:', error.message);
    return false;
  }
  return true;
}

export async function deleteTripFromSupabase(tripId: string): Promise<boolean> {
  const { error } = await supabase.from('trips').delete().eq('id', tripId);
  if (error) {
    console.warn('Failed to delete trip from Supabase:', error.message);
    return false;
  }
  return true;
}

export async function fetchUserTripsFromSupabase(userId: string): Promise<SavedTrip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.warn('Failed to fetch trips from Supabase:', error.message);
    return [];
  }
  return (data || []).map(fromSupabaseTrip);
}
