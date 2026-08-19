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
  Info,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { BudgetBreakdown, PageRoute } from '../types';
import { calculateDestinationBudgetBreakdown } from '../data/destinationsData';

export interface BudgetPlannerProps {
  destination?: string;
  startLocation?: string;
  travelers?: number;
  days?: number;
  travelDates?: string;
  budgetTier?: 'budget' | 'moderate' | 'luxury' | 'custom';
  customBudget?: number;
  onBudgetTierChange?: (tier: 'budget' | 'moderate' | 'luxury' | 'custom') => void;
  onCustomBudgetChange?: (amount: number | undefined) => void;
  onPlanTrip?: (destination: string, budget: number, travelers: number, days: number) => void;
  onNavigate?: (page: PageRoute) => void;
  standalone?: boolean;
}

type BudgetTierType = 'budget' | 'moderate' | 'luxury' | 'custom';

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  destination: propDestination,
  startLocation: propStartLocation,
  travelers: propTravelers,
  days: propDays,
  travelDates: propTravelDates,
  budgetTier: propBudgetTier,
  customBudget: propCustomBudget,
  onBudgetTierChange,
  onCustomBudgetChange,
  onPlanTrip,
  onNavigate,
  standalone = false,
}) => {
  // Local states for standalone mode (e.g. on HomePage)
  const [localStartLocation, setLocalStartLocation] = useState<string>('');
  const [localDestination, setLocalDestination] = useState<string>('');
  const [localTravelers, setLocalTravelers] = useState<number>(0);
  const [localDays, setLocalDays] = useState<number>(0);
  const [localTravelDates, setLocalTravelDates] = useState<string>('');
  const [localBudgetTier, setLocalBudgetTier] = useState<BudgetTierType>('moderate');
  const [localCustomBudgetInput, setLocalCustomBudgetInput] = useState<string>('');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  // Effective values (Prop takes precedence if provided)
  const destination = (propDestination !== undefined ? propDestination : localDestination).trim();
  const startLocation = (propStartLocation !== undefined ? propStartLocation : localStartLocation).trim();
  const travelers = propTravelers !== undefined && propTravelers > 0 ? propTravelers : localTravelers;
  const days = propDays !== undefined && propDays > 0 ? propDays : localDays;
  const travelDates = propTravelDates !== undefined ? propTravelDates : localTravelDates;
  const budgetTier = (propBudgetTier || localBudgetTier) as BudgetTierType;
  
  const customBudgetInput = propCustomBudget !== undefined 
    ? (propCustomBudget > 0 ? String(propCustomBudget) : '') 
    : localCustomBudgetInput;

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

  const handleTierSelect = (tier: BudgetTierType) => {
    if (onBudgetTierChange) {
      onBudgetTierChange(tier);
    }
    setLocalBudgetTier(tier);
  };

  const handleCustomBudgetChange = (valStr: string) => {
    setLocalCustomBudgetInput(valStr);
    const parsed = valStr.trim() ? parseFloat(valStr.replace(/[^0-9.]/g, '')) || 0 : undefined;
    if (onCustomBudgetChange) {
      onCustomBudgetChange(parsed);
    }
  };

  const parsedCustomBudget = customBudgetInput.trim() 
    ? parseFloat(customBudgetInput.replace(/[^0-9.]/g, '')) || 0 
    : undefined;

  // Validation: Check if core inputs are satisfied
  const hasMinInputs = destination.length > 0 && travelers > 0 && days > 0;

  // Dynamic budget calculation based on destination cost factors, travelers, days, and tier
  const calculatedBreakdown: BudgetBreakdown | null = useMemo(() => {
    if (!hasMinInputs) return null;

    return calculateDestinationBudgetBreakdown({
      destination,
      travelers,
      days,
      budgetTier,
      customBudget: budgetTier === 'custom' ? parsedCustomBudget : undefined,
    });
  }, [hasMinInputs, destination, travelers, days, budgetTier, parsedCustomBudget]);

  // Baseline minimum cost (Budget tier) for comparison
  const baselineBudgetCost = useMemo(() => {
    if (!hasMinInputs) return 0;
    const base = calculateDestinationBudgetBreakdown({
      destination,
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

    if (onPlanTrip && destination) {
      onPlanTrip(destination, targetAmt, travelers || 2, days || 3);
    } else if (onNavigate) {
      onNavigate('planner');
    }
  };

  return (
    <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-10 border border-[#E5DFD3] shadow-xs space-y-6">
      
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
          <p className="text-xs sm:text-sm text-[#57605B] mt-1 max-w-2xl leading-relaxed">
            Calculate realistic, destination-aware costs for accommodation, dining, transit, and activities with automatic live breakdown.
          </p>
        </div>

        {/* Budget tier selector chips */}
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
              onClick={() => handleTierSelect(tier.id as BudgetTierType)}
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

      {/* If standalone mode (e.g. on homepage), show clean inputs for locations & duration */}
      {standalone && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
              Starting Location
            </label>
            <div className="relative">
              <Navigation className="w-4 h-4 text-[#C8963E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={localStartLocation}
                onChange={(e) => setLocalStartLocation(e.target.value)}
                placeholder="e.g. Delhi, Mumbai..."
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-medium text-[#202422] placeholder:text-[#8C938E] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
              Destination *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#D96E37] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={localDestination}
                onChange={(e) => setLocalDestination(e.target.value)}
                placeholder="e.g. Goa, Jaipur, Manali..."
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-medium text-[#202422] placeholder:text-[#8C938E] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
              Travelers *
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={localTravelers}
                onChange={(e) => setLocalTravelers(Number(e.target.value))}
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

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
              Trip Duration *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={localDays}
                onChange={(e) => setLocalDays(Number(e.target.value))}
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
        </div>
      )}

      {/* Connected Source of Truth Summary Pill (When embedded in Planner or props supplied) */}
      {!standalone && (
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[#183B32] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#D96E37]" />
              {destination || 'Destination not set'}
            </span>
            <span className="text-[#8C938E]">•</span>
            <span className="text-[#57605B]">
              {travelers > 0 ? `${travelers} ${travelers === 1 ? 'Traveler' : 'Travelers'}` : 'Travelers not selected'}
            </span>
            <span className="text-[#8C938E]">•</span>
            <span className="text-[#57605B]">
              {days > 0 ? `${days} ${days === 1 ? 'Day' : 'Days'}` : 'Duration not selected'}
            </span>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-[#FFFFFF] border border-[#E2DACB] text-[10px] font-bold text-[#183B32] uppercase tracking-wider">
            Active Tier: {budgetTier}
          </span>
        </div>
      )}

      {/* Custom Budget Input & Savings Analysis (When Custom is selected) */}
      {budgetTier === 'custom' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] space-y-3 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                Enter Your Planned Target Budget (₹)
              </label>
              <p className="text-[11px] text-[#57605B]">
                We compare your custom budget against estimated costs and provide savings recommendations.
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
                onChange={(e) => handleCustomBudgetChange(e.target.value)}
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
                    <span className="text-[11px] text-[#57605B] block mt-0.5 leading-relaxed">
                      Your budget comfortably covers {days} days in {destination} for {travelers} {travelers === 1 ? 'traveler' : 'travelers'}. You have room for comfortable boutique stays and signature regional dining!
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#FEF6F0] border border-[#F6D5C2] text-[#D96E37] flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-[#D96E37] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">
                      Budget is Tight (Estimated minimum for {days} days: ₹{baselineBudgetCost.toLocaleString()})
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

      {/* Results / Breakdown Section */}
      {hasMinInputs && calculatedBreakdown ? (
        <div className="pt-2 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <h4 className="font-serif font-bold text-lg text-[#183B32]">
                Estimated Cost Breakdown for {destination}
              </h4>
              <p className="text-xs text-[#57605B]">
                Calculated for {travelers} {travelers === 1 ? 'traveler' : 'travelers'} • {days} {days === 1 ? 'day' : 'days'} • {budgetTier.toUpperCase()} style
              </p>
            </div>
            <span className="text-xs font-bold text-[#183B32] px-3 py-1 bg-[#FAF7F2] rounded-full border border-[#E2DACB] self-start sm:self-auto">
              ~{currency}{dailyPerPerson.toLocaleString()} / person / day
            </span>
          </div>

          {/* 5-Category Breakdown Cards */}
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
                  Souvenirs & buffer reserve
                </span>
              </div>
            </div>
          </div>

          {/* Summary Total & Action */}
          <div className="pt-4 border-t border-[#F0EBE0] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
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
                      <span className="text-[#2E7D32] flex items-center gap-1 text-sm font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Covered
                      </span>
                    ) : (
                      <span className="text-[#D96E37] flex items-center gap-1 text-sm font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" /> Tight
                      </span>
                    )
                  ) : (
                    budgetTier.charAt(0).toUpperCase() + budgetTier.slice(1)
                  )}
                </span>
              </div>
            </div>

            {standalone && (
              <button
                type="button"
                onClick={handleStartPlanning}
                className="px-8 py-4 rounded-2xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-sm font-bold shadow-md flex items-center justify-center gap-2 hover:scale-102 active:scale-98 transition-all cursor-pointer shrink-0"
              >
                <span>Plan Full Itinerary for {destination}</span>
                <ArrowRight className="w-4 h-4 text-[#E0B466]" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Explicit requirement: “Complete your trip details above to calculate your personalized budget.” */
        <div className="pt-4 border-t border-[#F0EBE0] text-center p-8 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] space-y-2">
          <Info className="w-6 h-6 text-[#C8963E] mx-auto opacity-80" />
          <h4 className="font-serif font-bold text-base text-[#183B32]">
            Complete your trip details above to calculate your personalized budget.
          </h4>
          <p className="text-xs text-[#57605B] max-w-md mx-auto leading-relaxed">
            Once you provide your destination, duration, and number of travelers in the form above, we will compute accurate regional costs for stays, meals, transit, and sightseeing.
          </p>
        </div>
      )}

    </div>
  );
};
