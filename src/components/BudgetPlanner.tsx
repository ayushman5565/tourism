import React, { useState, useMemo } from 'react';
import { 
  IndianRupee, 
  Users, 
  Calendar, 
  MapPin, 
  Bed, 
  Utensils, 
  Car, 
  Ticket, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { BudgetBreakdown, PageRoute } from '../types';

interface BudgetPlannerProps {
  onNavigate?: (page: PageRoute) => void;
  onPlanTrip?: (destination: string, budget: number, travelers: number, days: number) => void;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  onNavigate,
  onPlanTrip,
}) => {
  const [destination, setDestination] = useState('Jaipur');
  const [travelers, setTravelers] = useState<number>(2);
  const [days, setDays] = useState<number>(4);
  const [targetBudget, setTargetBudget] = useState<number>(10000);
  const currency = '₹';

  // Realistic intelligent distribution based on standard traveler expenditure metrics
  const calculatedBreakdown: BudgetBreakdown = useMemo(() => {
    // If target budget is provided, calculate optimal realistic category allocations
    const accommodation = Math.round(targetBudget * 0.36);
    const food = Math.round(targetBudget * 0.26);
    const transportation = Math.round(targetBudget * 0.16);
    const activities = Math.round(targetBudget * 0.14);
    const miscellaneous = Math.round(targetBudget * 0.08);

    const calculatedTotal = accommodation + food + transportation + activities + miscellaneous;
    const costPerPerson = Math.round(calculatedTotal / Math.max(1, travelers));
    const remainingBudget = targetBudget - calculatedTotal;

    return {
      accommodation,
      food,
      transportation,
      activities,
      miscellaneous,
      total: calculatedTotal,
      costPerPerson,
      remainingBudget,
      currency,
    };
  }, [targetBudget, travelers, currency]);

  // Per day per person average
  const dailyPerPerson = useMemo(() => {
    return Math.round(calculatedBreakdown.costPerPerson / Math.max(1, days));
  }, [calculatedBreakdown.costPerPerson, days]);

  const handleStartPlanning = () => {
    if (onPlanTrip) {
      onPlanTrip(destination, targetBudget, travelers, days);
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
          <p className="text-xs sm:text-sm text-[#57605B] mt-1">
            Calculate realistic costs for accommodation, dining, transit, and sightseeing without hidden fees.
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-[#8C938E] font-medium hidden sm:inline">Budget preset:</span>
          {[
            { label: 'Short Trip (₹8,000)', val: 8000, d: 3 },
            { label: 'Standard (₹15,000)', val: 15000, d: 4 },
            { label: 'Comfort (₹30,000)', val: 30000, d: 7 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setTargetBudget(preset.val);
                setDays(preset.d);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                targetBudget === preset.val
                  ? 'bg-[#183B32] text-[#FAF7F2] border-[#183B32]'
                  : 'bg-[#FAF7F2] text-[#57605B] border-[#E2DACB] hover:bg-[#EFE9DE]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* 1. Destination */}
        <div>
          <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider mb-1.5">
            Destination
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-[#C8963E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Jaipur, Kyoto, Bali"
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-medium text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
            />
          </div>
        </div>

        {/* 2. Number of Travellers */}
        <div>
          <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider mb-1.5">
            Travellers
          </label>
          <div className="relative">
            <Users className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={travelers}
              onChange={(e) => setTravelers(Math.max(1, Number(e.target.value)))}
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-medium text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
            >
              <option value={1}>1 Solo Explorer</option>
              <option value={2}>2 Travellers</option>
              <option value={3}>3 Travellers</option>
              <option value={4}>4 Travellers</option>
              <option value={5}>5 Travellers</option>
              <option value={6}>6+ Group</option>
            </select>
          </div>
        </div>

        {/* 3. Number of Days */}
        <div>
          <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider mb-1.5">
            Trip Duration
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={days}
              onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-medium text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
            >
              {[1, 2, 3, 4, 5, 6, 7, 10, 14, 21].map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? 'Day' : 'Days'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Approximate Total Budget */}
        <div>
          <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider mb-1.5">
            Approx. Total Budget
          </label>
          <div className="relative">
            <span className="text-sm font-bold text-[#183B32] absolute left-3.5 top-1/2 -translate-y-1/2">
              ₹
            </span>
            <input
              type="number"
              min={1000}
              step={500}
              value={targetBudget}
              onChange={(e) => setTargetBudget(Math.max(1000, Number(e.target.value)))}
              className="w-full pl-8 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-bold text-[#183B32] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
            />
          </div>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-serif font-bold text-base text-[#183B32]">
            Estimated Budget Breakdown
          </h4>
          <span className="text-xs text-[#57605B]">
            ~{currency}{dailyPerPerson} / person / day
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Accommodation */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex flex-col justify-between space-y-2 hover:border-[#183B32]/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#EFE9DE] text-[#183B32] flex items-center justify-center">
                <Bed className="w-4 h-4 text-[#183B32]" />
              </div>
              <span className="text-[10px] font-bold text-[#8C938E] uppercase">36%</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-[#183B32]">Accommodation</span>
              <span className="text-lg font-serif font-bold text-[#183B32]">
                {currency}{calculatedBreakdown.accommodation}
              </span>
              <span className="block text-[10px] text-[#8C938E] mt-0.5">
                ~{currency}{Math.round(calculatedBreakdown.accommodation / days)} / night
              </span>
            </div>
          </div>

          {/* 2. Food & Dining */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex flex-col justify-between space-y-2 hover:border-[#183B32]/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#EFE9DE] text-[#183B32] flex items-center justify-center">
                <Utensils className="w-4 h-4 text-[#D96E37]" />
              </div>
              <span className="text-[10px] font-bold text-[#8C938E] uppercase">26%</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-[#183B32]">Food & Meals</span>
              <span className="text-lg font-serif font-bold text-[#183B32]">
                {currency}{calculatedBreakdown.food}
              </span>
              <span className="block text-[10px] text-[#8C938E] mt-0.5">
                ~{currency}{Math.round(calculatedBreakdown.food / (days * travelers))} / meal / person
              </span>
            </div>
          </div>

          {/* 3. Transportation */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex flex-col justify-between space-y-2 hover:border-[#183B32]/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#EFE9DE] text-[#183B32] flex items-center justify-center">
                <Car className="w-4 h-4 text-[#C8963E]" />
              </div>
              <span className="text-[10px] font-bold text-[#8C938E] uppercase">16%</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-[#183B32]">Transportation</span>
              <span className="text-lg font-serif font-bold text-[#183B32]">
                {currency}{calculatedBreakdown.transportation}
              </span>
              <span className="block text-[10px] text-[#8C938E] mt-0.5">
                Cabs, metro & transit
              </span>
            </div>
          </div>

          {/* 4. Activities & Sightseeing */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex flex-col justify-between space-y-2 hover:border-[#183B32]/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#EFE9DE] text-[#183B32] flex items-center justify-center">
                <Ticket className="w-4 h-4 text-[#183B32]" />
              </div>
              <span className="text-[10px] font-bold text-[#8C938E] uppercase">14%</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-[#183B32]">Activities & Entry</span>
              <span className="text-lg font-serif font-bold text-[#183B32]">
                {currency}{calculatedBreakdown.activities}
              </span>
              <span className="block text-[10px] text-[#8C938E] mt-0.5">
                Monuments & tours
              </span>
            </div>
          </div>

          {/* 5. Miscellaneous & Souvenirs */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex flex-col justify-between space-y-2 hover:border-[#183B32]/40 transition-colors col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#EFE9DE] text-[#183B32] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#4E3C2F]" />
              </div>
              <span className="text-[10px] font-bold text-[#8C938E] uppercase">8%</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-[#183B32]">Miscellaneous</span>
              <span className="text-lg font-serif font-bold text-[#183B32]">
                {currency}{calculatedBreakdown.miscellaneous}
              </span>
              <span className="block text-[10px] text-[#8C938E] mt-0.5">
                Souvenirs & reserve
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Footer & Action Bar */}
      <div className="mt-8 pt-6 border-t border-[#F0EBE0] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 flex-1">
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
            <span className="text-[10px] font-bold text-[#8C938E] uppercase tracking-wider block">
              Estimated Total
            </span>
            <span className="font-serif font-bold text-xl text-[#183B32] mt-0.5 block">
              {currency}{calculatedBreakdown.total}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
            <span className="text-[10px] font-bold text-[#8C938E] uppercase tracking-wider block">
              Cost Per Person
            </span>
            <span className="font-serif font-bold text-xl text-[#183B32] mt-0.5 block">
              {currency}{calculatedBreakdown.costPerPerson}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
            <span className="text-[10px] font-bold text-[#8C938E] uppercase tracking-wider block">
              Remaining Budget
            </span>
            <span className="font-serif font-bold text-xl text-[#183B32] mt-0.5 flex items-center gap-1">
              {currency}{calculatedBreakdown.remainingBudget}
              <CheckCircle2 className="w-3.5 h-3.5 text-[#183B32] inline" />
            </span>
          </div>
        </div>

        {/* CTA to Plan Trip */}
        <button
          type="button"
          onClick={handleStartPlanning}
          className="px-6 py-4 rounded-2xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98 cursor-pointer shrink-0"
        >
          <span>Plan Itinerary for {destination}</span>
          <ArrowRight className="w-4 h-4 text-[#E0B466]" />
        </button>
      </div>
    </div>
  );
};
