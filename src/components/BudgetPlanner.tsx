import React, { useState, useMemo } from 'react';
import { 
  IndianRupee, 
  Users, 
  Calendar, 
  MapPin, 
  Navigation,
  Bed, 
  Utensils, 
  Car, 
  Ticket, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Info
} from 'lucide-react';
import { BudgetBreakdown, PageRoute } from '../types';
import { calculateDestinationBudgetBreakdown } from '../data/destinationsData';

interface BudgetPlannerProps {
  onNavigate?: (page: PageRoute) => void;
  onPlanTrip?: (destination: string, budget: number, travelers: number, days: number) => void;
}

type BudgetTierType = 'budget' | 'moderate' | 'luxury' | 'custom';

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  onNavigate,
  onPlanTrip,
}) => {
  // 1. Core Inputs with NO hardcoded default destination/dates/travelers/budget
  const [startLocation, setStartLocation] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [travelers, setTravelers] = useState<number>(0);
  const [days, setDays] = useState<number>(0);
  const [travelDates, setTravelDates] = useState<string>('');
  const [budgetTier, setBudgetTier] = useState<BudgetTierType>('moderate');
  const [customBudgetInput, setCustomBudgetInput] = useState<string>('');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const currency = '₹';

  const availablePreferences = [
    'Heritage & History',
    'Street Food & Local Dining',
    'Scenic Nature & Hills',
    'Beaches & Coastal',
    'Peaceful & Wellness',
    'Shopping & Crafts',
  ];

  const togglePreference = (pref: string) => {
    if (selectedPreferences.includes(pref)) {
      setSelectedPreferences(selectedPreferences.filter((p) => p !== pref));
    } else {
      setSelectedPreferences([...selectedPreferences, pref]);
    }
  };

  const parsedCustomBudget = customBudgetInput.trim() ? parseFloat(customBudgetInput.replace(/[^0-9.]/g, '')) || 0 : undefined;

  // Calculate destination & traveler scaled realistic breakdown
  const hasMinInputs = destination.trim().length > 0 && travelers > 0 && days > 0;

  const calculatedBreakdown: BudgetBreakdown | null = useMemo(() => {
    if (!hasMinInputs) return null;

    return calculateDestinationBudgetBreakdown({
      destination: destination.trim(),
      travelers,
      days,
      budgetTier,
      customBudget: budgetTier === 'custom' ? parsedCustomBudget : undefined,
    });
  }, [hasMinInputs, destination, travelers, days, budgetTier, parsedCustomBudget]);

  // Baseline minimum cost (Budget tier) for custom budget comparison
  const baselineBudgetCost = useMemo(() => {
    if (!hasMinInputs) return 0;
    const base = calculateDestinationBudgetBreakdown({
      destination: destination.trim(),
      travelers,
      days,
      budgetTier: 'budget',
    });
    return base.total;
  }, [hasMinInputs, destination, travelers, days]);

  // Per person per day metrics
  const dailyPerPerson = useMemo(() => {
    if (!calculatedBreakdown || travelers === 0 || days === 0) return 0;
    return Math.round(calculatedBreakdown.total / (travelers * days));
  }, [calculatedBreakdown, travelers, days]);

  const handleStartPlanning = () => {
    const targetAmt = budgetTier === 'custom' && parsedCustomBudget 
      ? parsedCustomBudget 
      : calculatedBreakdown?.total || 10000;

    if (onPlanTrip && destination.trim()) {
      onPlanTrip(destination.trim(), targetAmt, travelers || 2, days || 3);
    } else if (onNavigate) {
      onNavigate('planner');
    }
  };

  return (
    <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-10 border border-[#E5DFD3] shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EBE0]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE9DE] border border-[#E2DACB] text-[11px] font-bold text-[#183B32] uppercase tracking-wider mb-2">
            <IndianRupee className="w-3.5 h-3.5 text-[#C8963E]" />
            <span>Smart Travel Estimator</span>
          </div>
          <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#183B32]">
            Trip Budget Planner
          </h3>
          <p className="text-xs sm:text-sm text-[#57605B] mt-1 max-w-2xl">
            Calculate realistic, destination-aware costs for accommodation, dining, transit, and activities based on your exact trip parameters.
          </p>
        </div>

        {/* Quick presets for budget tier */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <span className="text-xs text-[#8C938E] font-medium hidden sm:inline mr-1">Style:</span>
          {[
            { id: 'budget', label: 'Budget' },
            { id: 'moderate', label: 'Balanced' },
            { id: 'luxury', label: 'Luxury' },
            { id: 'custom', label: 'Custom' },
          ].map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => setBudgetTier(tier.id as BudgetTierType)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                budgetTier === tier.id
                  ? 'bg-[#183B32] text-[#FAF7F2] border-[#183B32] shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#57605B] border-[#E2DACB] hover:bg-[#EFE9DE]'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Grid: Fixed responsive spacing to prevent label & input overlap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        
        {/* 1. Starting Location */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
            Starting Location
          </label>
          <div className="relative">
            <Navigation className="w-4 h-4 text-[#C8963E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              placeholder="e.g. Delhi, Mumbai, Bengaluru..."
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-medium text-[#202422] placeholder:text-[#8C938E] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
            />
          </div>
        </div>

        {/* 2. Destination */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
            Destination
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-[#D96E37] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Jaipur, Goa, Manali, Kerala..."
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-medium text-[#202422] placeholder:text-[#8C938E] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
            />
          </div>
        </div>

        {/* 3. Number of Travellers */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
            Number of Travellers
          </label>
          <div className="relative">
            <Users className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-medium text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 cursor-pointer"
            >
              <option value={0}>Select Travelers</option>
              <option value={1}>1 Solo Explorer</option>
              <option value={2}>2 Travellers</option>
              <option value={3}>3 Travellers</option>
              <option value={4}>4 Travellers</option>
              <option value={5}>5 Travellers</option>
              <option value={6}>6+ Group</option>
            </select>
          </div>
        </div>

        {/* 4. Trip Duration */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
            Trip Duration
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-medium text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 cursor-pointer"
            >
              <option value={0}>Select Duration</option>
              {[1, 2, 3, 4, 5, 6, 7, 10, 14, 21].map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? 'Day (Day Trip)' : 'Days'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 5. Travel Dates */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
            Travel Dates (Optional)
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={travelDates}
              onChange={(e) => setTravelDates(e.target.value)}
              placeholder="e.g. Next weekend, Oct 15-18..."
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-medium text-[#202422] placeholder:text-[#8C938E] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
            />
          </div>
        </div>

        {/* 6. Budget Preference Selector / Custom Budget */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
            Budget Preference
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'budget', label: 'Budget' },
              { id: 'moderate', label: 'Balanced' },
              { id: 'luxury', label: 'Luxury' },
              { id: 'custom', label: 'Custom' },
            ].map((tier) => {
              const isSelected = budgetTier === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setBudgetTier(tier.id as BudgetTierType)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#183B32] text-[#FAF7F2] border-[#183B32]'
                      : 'bg-[#FAF7F2] text-[#57605B] border-[#E2DACB] hover:bg-[#EFE9DE]'
                  }`}
                >
                  {tier.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Custom Budget Input Field (When Custom is selected) */}
      {budgetTier === 'custom' && (
        <div className="mt-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] space-y-2 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                Enter Your Planned Total Budget (₹)
              </label>
              <p className="text-[11px] text-[#57605B]">
                We will analyze your budget against estimated destination costs and provide actionable savings tips.
              </p>
            </div>
            <div className="relative sm:w-64">
              <span className="text-sm font-bold text-[#183B32] absolute left-3.5 top-1/2 -translate-y-1/2">
                ₹
              </span>
              <input
                type="number"
                min={500}
                step={500}
                value={customBudgetInput}
                onChange={(e) => setCustomBudgetInput(e.target.value)}
                placeholder="e.g. 25000"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E2DACB] text-sm font-bold text-[#183B32] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
              />
            </div>
          </div>

          {/* Dynamic Budget Comparison & Guidance */}
          {hasMinInputs && parsedCustomBudget !== undefined && parsedCustomBudget > 0 && (
            <div className="pt-2 border-t border-[#EAE3D6] text-xs">
              {parsedCustomBudget >= baselineBudgetCost ? (
                <div className="p-3 rounded-xl bg-[#F0F7F4] border border-[#CDE5DC] text-[#183B32] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">
                      Sufficient Budget (Surplus: ₹{(parsedCustomBudget - (calculatedBreakdown?.total || 0)).toLocaleString()})
                    </span>
                    <span className="text-[11px] text-[#57605B] block mt-0.5">
                      Your budget comfortably covers {days} days in {destination} for {travelers} travelers. You have room for boutique stays or signature regional dining!
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#FEF6F0] border border-[#F6D5C2] text-[#D96E37] flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-[#D96E37] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">
                      Budget is Tight (Estimated minimum: ₹{baselineBudgetCost.toLocaleString()})
                    </span>
                    <span className="text-[11px] text-[#57605B] block mt-0.5">
                      Shortfall of ~₹{(baselineBudgetCost - parsedCustomBudget).toLocaleString()}. Suggestions to fit within ₹{parsedCustomBudget.toLocaleString()}:
                    </span>
                    <ul className="list-disc list-inside text-[11px] text-[#57605B] mt-1 space-y-0.5">
                      {days > 2 && <li>Consider shortening the trip by 1 day to save on lodging and meals.</li>}
                      <li>Choose authentic homestays, hostels, or guest rooms instead of hotels.</li>
                      <li>Use state buses or express trains instead of private cabs.</li>
                      <li>Enjoy local street food and traditional thalis.</li>
                      <li>Prioritize free scenic viewpoints, public ghats, and nature trails.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Travel Preferences / Interests */}
      <div className="mt-5 pt-4 border-t border-[#F0EBE0]">
        <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider mb-2">
          Travel Preferences & Focus (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {availablePreferences.map((pref) => {
            const isSelected = selectedPreferences.includes(pref);
            return (
              <button
                key={pref}
                type="button"
                onClick={() => togglePreference(pref)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#183B32] text-[#FAF7F2] shadow-2xs font-semibold'
                    : 'bg-[#FAF7F2] text-[#57605B] border border-[#E2DACB] hover:bg-[#EFE9DE]'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {pref}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results / Breakdown Section */}
      {hasMinInputs && calculatedBreakdown ? (
        <div className="mt-8 pt-6 border-t border-[#F0EBE0] animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-serif font-bold text-lg text-[#183B32]">
                Estimated Cost Breakdown for {destination}
              </h4>
              <p className="text-xs text-[#57605B]">
                Calculated for {travelers} {travelers === 1 ? 'traveler' : 'travelers'} • {days} {days === 1 ? 'day' : 'days'} • {budgetTier.toUpperCase()} style
              </p>
            </div>
            <span className="text-xs font-bold text-[#183B32] px-3 py-1 bg-[#FAF7F2] rounded-full border border-[#E2DACB]">
              ~{currency}{dailyPerPerson.toLocaleString()} / person / day
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* 1. Accommodation */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex flex-col justify-between space-y-2 hover:border-[#183B32]/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#EFE9DE] text-[#183B32] flex items-center justify-center">
                  <Bed className="w-4 h-4 text-[#183B32]" />
                </div>
                <span className="text-[10px] font-bold text-[#8C938E] uppercase">Stay</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#183B32]">Accommodation</span>
                <span className="text-lg font-serif font-bold text-[#183B32]">
                  {currency}{calculatedBreakdown.accommodation.toLocaleString()}
                </span>
                <span className="block text-[10px] text-[#8C938E] mt-0.5">
                  ~{currency}{Math.round(calculatedBreakdown.accommodation / Math.max(1, days - 1 || 1)).toLocaleString()} / night
                </span>
              </div>
            </div>

            {/* 2. Food & Dining */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex flex-col justify-between space-y-2 hover:border-[#183B32]/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#EFE9DE] text-[#183B32] flex items-center justify-center">
                  <Utensils className="w-4 h-4 text-[#D96E37]" />
                </div>
                <span className="text-[10px] font-bold text-[#8C938E] uppercase">Meals</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#183B32]">Food & Dining</span>
                <span className="text-lg font-serif font-bold text-[#183B32]">
                  {currency}{calculatedBreakdown.food.toLocaleString()}
                </span>
                <span className="block text-[10px] text-[#8C938E] mt-0.5">
                  ~{currency}{Math.round(calculatedBreakdown.food / (days * travelers)).toLocaleString()} / day / person
                </span>
              </div>
            </div>

            {/* 3. Transportation */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex flex-col justify-between space-y-2 hover:border-[#183B32]/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#EFE9DE] text-[#183B32] flex items-center justify-center">
                  <Car className="w-4 h-4 text-[#C8963E]" />
                </div>
                <span className="text-[10px] font-bold text-[#8C938E] uppercase">Transit</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#183B32]">Transportation</span>
                <span className="text-lg font-serif font-bold text-[#183B32]">
                  {currency}{calculatedBreakdown.transportation.toLocaleString()}
                </span>
                <span className="block text-[10px] text-[#8C938E] mt-0.5">
                  Intercity & local transit
                </span>
              </div>
            </div>

            {/* 4. Activities & Sightseeing */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex flex-col justify-between space-y-2 hover:border-[#183B32]/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#EFE9DE] text-[#183B32] flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-[#183B32]" />
                </div>
                <span className="text-[10px] font-bold text-[#8C938E] uppercase">Sights</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#183B32]">Activities & Entry</span>
                <span className="text-lg font-serif font-bold text-[#183B32]">
                  {currency}{calculatedBreakdown.activities.toLocaleString()}
                </span>
                <span className="block text-[10px] text-[#8C938E] mt-0.5">
                  Tours, permits & tickets
                </span>
              </div>
            </div>

            {/* 5. Miscellaneous & Souvenirs */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex flex-col justify-between space-y-2 hover:border-[#183B32]/40 transition-colors col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#EFE9DE] text-[#183B32] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-[#4E3C2F]" />
                </div>
                <span className="text-[10px] font-bold text-[#8C938E] uppercase">Misc</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#183B32]">Miscellaneous</span>
                <span className="text-lg font-serif font-bold text-[#183B32]">
                  {currency}{calculatedBreakdown.miscellaneous.toLocaleString()}
                </span>
                <span className="block text-[10px] text-[#8C938E] mt-0.5">
                  Souvenirs & reserve
                </span>
              </div>
            </div>
          </div>

          {/* Summary Total & Action */}
          <div className="mt-6 pt-5 border-t border-[#F0EBE0] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
                <span className="text-[10px] font-bold text-[#8C938E] uppercase tracking-wider block">
                  Total Estimated
                </span>
                <span className="font-serif font-bold text-xl text-[#183B32] mt-0.5 block">
                  {currency}{calculatedBreakdown.total.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
                <span className="text-[10px] font-bold text-[#8C938E] uppercase tracking-wider block">
                  Cost Per Person
                </span>
                <span className="font-serif font-bold text-xl text-[#183B32] mt-0.5 block">
                  {currency}{calculatedBreakdown.costPerPerson.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-[#8C938E] uppercase tracking-wider block">
                  {budgetTier === 'custom' && parsedCustomBudget ? 'Budget Status' : 'Trip Tier'}
                </span>
                <span className="font-serif font-bold text-base text-[#183B32] mt-0.5 flex items-center gap-1">
                  {budgetTier === 'custom' && parsedCustomBudget ? (
                    parsedCustomBudget >= calculatedBreakdown.total ? (
                      <span className="text-[#2E7D32] flex items-center gap-1 text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Covered
                      </span>
                    ) : (
                      <span className="text-[#D96E37] flex items-center gap-1 text-sm">
                        <AlertCircle className="w-3.5 h-3.5" /> Tight
                      </span>
                    )
                  ) : (
                    budgetTier.charAt(0).toUpperCase() + budgetTier.slice(1)
                  )}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartPlanning}
              className="px-8 py-4 rounded-2xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-sm font-bold shadow-md flex items-center justify-center gap-2 hover:scale-102 active:scale-98 transition-all cursor-pointer shrink-0"
            >
              <span>Plan Full Itinerary for {destination}</span>
              <ArrowRight className="w-4 h-4 text-[#E0B466]" />
            </button>
          </div>
        </div>
      ) : (
        /* Helpful guidance state before all fields are selected */
        <div className="mt-8 pt-6 border-t border-[#F0EBE0] text-center p-6 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
          <Info className="w-6 h-6 text-[#C8963E] mx-auto mb-2" />
          <h4 className="font-serif font-bold text-sm text-[#183B32]">
            Enter Destination, Travelers & Duration Above
          </h4>
          <p className="text-xs text-[#57605B] mt-1 max-w-md mx-auto">
            Provide your travel destination, number of travelers, and trip length to receive an instant, destination-aware expense breakdown.
          </p>
        </div>
      )}
    </div>
  );
};
