import { SavedTrip } from '../types';
import { supabase } from '../lib/supabase';

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
    // Store the complete itinerary document alongside searchable trip columns.
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

/** Creates or updates a trip in Supabase. Trip data is never written to browser storage. */
export async function saveTrip(trip: SavedTrip, userId?: string | null): Promise<SavedTrip> {
  if (!userId) {
    throw new Error('Sign in is required before a trip can be saved.');
  }

  const savedTrip: SavedTrip = {
    ...trip,
    createdAt: trip.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const { error } = await supabase
    .from('trips')
    .upsert(toSupabaseTrip(savedTrip, userId), { onConflict: 'id' });

  if (error) {
    throw new Error(`Could not save trip to Supabase: ${error.message}`);
  }
  return savedTrip;
}

export async function deleteTripFromSupabase(tripId: string): Promise<void> {
  const { error } = await supabase.from('trips').delete().eq('id', tripId);
  if (error) {
    throw new Error(`Could not delete trip from Supabase: ${error.message}`);
  }
}

export async function fetchUserTripsFromSupabase(userId: string): Promise<SavedTrip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Could not load trips from Supabase: ${error.message}`);
  }
  return (data || []).map(fromSupabaseTrip);
}
