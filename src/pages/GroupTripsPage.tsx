import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  Sparkles, 
  UserPlus, 
  CreditCard, 
  PieChart, 
  AlertCircle, 
  X, 
  Check, 
  Receipt, 
  Wallet, 
  TrendingUp, 
  ArrowRight,
  Split,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GroupTrip, GroupExpense, PageRoute } from '../types';

interface GroupTripsPageProps {
  initialTripName?: string;
  onNavigate: (page: PageRoute) => void;
}

export const GroupTripsPage: React.FC<GroupTripsPageProps> = ({
  initialTripName,
  onNavigate,
}) => {
  const [trip, setTrip] = useState<GroupTrip>(() => {
    const saved = localStorage.getItem('triptale_group_trip_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          id: parsed.id || `group-trip-${Date.now()}`,
          name: parsed.name || (initialTripName ? `${initialTripName} Trip` : 'Group Travel Expedition'),
          destination: parsed.destination || initialTripName || 'Trip Destination',
          currency: '₹',
          members: Array.isArray(parsed.members) ? parsed.members : [],
          memberBudgets: parsed.memberBudgets || {},
          expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
        };
      } catch (e) {}
    }
    return {
      id: `group-trip-${Date.now()}`,
      name: initialTripName ? `${initialTripName} Trip` : 'Group Travel Expedition',
      destination: initialTripName || 'Trip Destination',
      currency: '₹',
      members: [],
      memberBudgets: {},
      expenses: [],
    };
  });

  // TripTale uses INR for all shared expense tracking.
  const currency = '₹';

  // Add Member State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberBudget, setNewMemberBudget] = useState('');
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  // Edit Member Modal State
  const [editingMember, setEditingMember] = useState<{
    oldName: string;
    newName: string;
    budget: string;
  } | null>(null);

  // Add Expense for Member State
  const [activeAddExpenseMember, setActiveAddExpenseMember] = useState<string | null>(null);
  const [expAmount, setExpAmount] = useState('');
  const [expDescription, setExpDescription] = useState('');
  const [expCategory, setExpCategory] = useState<'Stay' | 'Food' | 'Transport' | 'Tickets' | 'Activities' | 'Other'>('Food');

  // Expanded histories state (which members have their history expanded)
  const [expandedHistories, setExpandedHistories] = useState<Record<string, boolean>>({});

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('triptale_group_trip_v3', JSON.stringify(trip));
    } catch (error) {
      console.warn('Unable to save group-trip data locally:', error);
    }
  }, [trip]);

  // Toggle history visibility for a member
  const toggleHistory = (memberName: string) => {
    setExpandedHistories((prev) => ({
      ...prev,
      [memberName]: !prev[memberName],
    }));
  };

  // 1. Handle Add Member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newMemberName.trim();
    if (!name || trip.members.includes(name)) return;

    const parsedBudget = newMemberBudget.trim() ? parseFloat(newMemberBudget.trim()) : null;
    const updatedMembers = [...trip.members, name];
    const updatedBudgets = {
      ...(trip.memberBudgets || {}),
      [name]: parsedBudget && !isNaN(parsedBudget) && parsedBudget > 0 ? parsedBudget : null,
    };

    setTrip({
      ...trip,
      members: updatedMembers,
      memberBudgets: updatedBudgets,
    });

    setNewMemberName('');
    setNewMemberBudget('');
  };

  // 2. Handle Edit Member (Name & Budget)
  const handleSaveMemberEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const trimmedNewName = editingMember.newName.trim();
    if (!trimmedNewName) return;

    const oldName = editingMember.oldName;
    if (trimmedNewName !== oldName && trip.members.includes(trimmedNewName)) {
      alert('A member with this name already exists.');
      return;
    }

    const parsedBudget = editingMember.budget.trim() ? parseFloat(editingMember.budget.trim()) : null;
    const validBudget = parsedBudget && !isNaN(parsedBudget) && parsedBudget > 0 ? parsedBudget : null;

    const updatedMembers = trip.members.map((m) => (m === oldName ? trimmedNewName : m));
    
    // Update budgets map
    const updatedBudgets: Record<string, number | null> = { ...(trip.memberBudgets || {}) };
    delete updatedBudgets[oldName];
    updatedBudgets[trimmedNewName] = validBudget;

    // Update member name in all expenses
    const updatedExpenses = trip.expenses.map((exp) => ({
      ...exp,
      paidBy: exp.paidBy === oldName ? trimmedNewName : exp.paidBy,
      splitAmong: exp.splitAmong ? exp.splitAmong.map((m) => (m === oldName ? trimmedNewName : m)) : undefined,
    }));

    setTrip({
      ...trip,
      members: updatedMembers,
      memberBudgets: updatedBudgets,
      expenses: updatedExpenses,
    });

    setEditingMember(null);
  };

  // 3. Handle Delete Member
  const confirmDeleteMember = () => {
    if (!memberToDelete) return;
    const name = memberToDelete;
    const updatedMembers = trip.members.filter((m) => m !== name);

    // Remove budgets
    const updatedBudgets = { ...(trip.memberBudgets || {}) };
    delete updatedBudgets[name];

    // Remove expenses paid by this member
    const updatedExpenses = trip.expenses.filter((e) => e.paidBy !== name);

    setTrip({
      ...trip,
      members: updatedMembers,
      memberBudgets: updatedBudgets,
      expenses: updatedExpenses,
    });

    setMemberToDelete(null);
  };

  // 4. Handle Add Individual Expense for a Member
  const handleAddIndividualExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAddExpenseMember) return;

    const amountNum = parseFloat(expAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const titleText = expDescription.trim() || `${expCategory} Expense`;

    const newExpense: GroupExpense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: titleText,
      amount: amountNum,
      paidBy: activeAddExpenseMember,
      category: expCategory,
      date: new Date().toISOString().split('T')[0],
    };

    setTrip({
      ...trip,
      expenses: [newExpense, ...trip.expenses],
    });

    // Reset Form
    setExpAmount('');
    setExpDescription('');
    setActiveAddExpenseMember(null);
  };

  // 5. Handle Delete Individual Expense
  const handleDeleteExpense = (expenseId: string) => {
    setTrip({
      ...trip,
      expenses: trip.expenses.filter((e) => e.id !== expenseId),
    });
  };

  // CALCULATIONS
  // Calculate total spent for each member (sum of all expenses paid by them)
  const memberSpentMap: Record<string, number> = {};
  trip.members.forEach((m) => {
    memberSpentMap[m] = 0;
  });

  trip.expenses.forEach((exp) => {
    if (memberSpentMap[exp.paidBy] !== undefined) {
      memberSpentMap[exp.paidBy] += exp.amount;
    } else {
      memberSpentMap[exp.paidBy] = exp.amount;
    }
  });

  // Calculate Group Totals
  const groupTotalSpent = Object.values(memberSpentMap).reduce((acc, curr) => acc + curr, 0);

  // Group Total Budget (sum of members with budgets)
  const groupTotalBudget = Object.entries(trip.memberBudgets || {}).reduce((acc, [member, b]) => {
    if (trip.members.includes(member) && typeof b === 'number' && b > 0) {
      return acc + b;
    }
    return acc;
  }, 0);

  return (
    <div className="min-h-screen bg-peaceful-bg-pattern text-[#202422] pb-24">
      
      {/* 1. DELETE MEMBER CONFIRMATION MODAL */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B32]/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF7F2] p-6 rounded-3xl border border-[#E5DFD3] shadow-xl max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 text-[#D96E37]">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif font-bold text-lg text-[#183B32]">Remove Member?</h3>
            </div>
            <p className="text-xs text-[#57605B] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#183B32]">{memberToDelete}</strong>? All their logged expenses ({currency}{memberSpentMap[memberToDelete]?.toLocaleString() || 0}) will be removed from the group total.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#57605B] hover:bg-[#EFE9DE] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMember}
                className="px-4 py-2 rounded-xl bg-[#D96E37] text-[#FAF7F2] text-xs font-bold hover:bg-[#BF5C28] transition-colors shadow-sm cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT MEMBER MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B32]/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-[#E5DFD3] shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
              <h3 className="font-serif font-bold text-lg text-[#183B32] flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#183B32]" />
                <span>Edit Companion Details</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-lg text-[#8C938E] hover:text-[#183B32] hover:bg-[#EFE9DE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-[#183B32] uppercase tracking-wider text-[11px]">
                  Member Name
                </label>
                <input
                  type="text"
                  value={editingMember.newName}
                  onChange={(e) => setEditingMember({ ...editingMember, newName: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E2DACB] text-xs text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#183B32] uppercase tracking-wider text-[11px]">
                  Individual Budget ({currency}) <span className="text-[#8C938E] font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={editingMember.budget}
                  onChange={(e) => setEditingMember({ ...editingMember, budget: e.target.value })}
                  placeholder="e.g. 5000 (leave blank for no limit)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E2DACB] text-xs text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 font-medium"
                />
                <p className="text-[10px] text-[#8C938E]">
                  Setting a budget helps track remaining funds as expenses are logged.
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-[#EAE3D6]">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#57605B] hover:bg-[#EFE9DE] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#183B32] text-[#FAF7F2] text-xs font-bold hover:bg-[#245246] transition-colors shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ADD EXPENSE MODAL */}
      {activeAddExpenseMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B32]/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-[#E5DFD3] shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C8963E]">
                  Add Member Expense
                </span>
                <h3 className="font-serif font-bold text-lg text-[#183B32]">
                  {activeAddExpenseMember}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveAddExpenseMember(null);
                  setExpAmount('');
                  setExpDescription('');
                }}
                className="p-1 rounded-lg text-[#8C938E] hover:text-[#183B32] hover:bg-[#EFE9DE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddIndividualExpense} className="space-y-4 text-xs">
              
              {/* Amount (Required) */}
              <div className="space-y-1">
                <label className="block font-bold text-[#183B32] uppercase tracking-wider text-[11px]">
                  Amount ({currency}) *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-base font-bold text-[#183B32]">
                    {currency}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    autoFocus
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#FFFFFF] border border-[#E2DACB] text-base font-bold text-[#183B32] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                  />
                </div>
              </div>

              {/* Description (Optional) */}
              <div className="space-y-1">
                <label className="block font-bold text-[#183B32] uppercase tracking-wider text-[11px]">
                  Expense Description <span className="text-[#8C938E] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  placeholder="e.g. Hotel, Food, Taxi, Sightseeing Ticket..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E2DACB] text-xs text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 font-medium"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="block font-bold text-[#183B32] uppercase tracking-wider text-[11px]">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Food', label: '🍲 Food' },
                    { id: 'Stay', label: '🏨 Hotel / Stay' },
                    { id: 'Transport', label: '🚖 Taxi / Ride' },
                    { id: 'Tickets', label: '🎟️ Tickets' },
                    { id: 'Activities', label: '🏄 Activities' },
                    { id: 'Other', label: '📦 Other' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setExpCategory(cat.id as any)}
                      className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold text-center transition-all cursor-pointer ${
                        expCategory === cat.id
                          ? 'bg-[#183B32] text-[#FAF7F2] border-[#183B32] shadow-xs'
                          : 'bg-[#FFFFFF] text-[#57605B] border-[#E2DACB] hover:bg-[#F3ECE0]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EAE3D6] text-[11px] text-[#57605B]">
                Current Total for {activeAddExpenseMember}:{' '}
                <strong className="text-[#183B32]">
                  {currency}{(memberSpentMap[activeAddExpenseMember] || 0).toLocaleString()}
                </strong>
                {expAmount && !isNaN(parseFloat(expAmount)) && parseFloat(expAmount) > 0 && (
                  <span className="block mt-0.5 text-[#183B32]">
                    → New Total will be:{' '}
                    <strong>
                      {currency}
                      {((memberSpentMap[activeAddExpenseMember] || 0) + parseFloat(expAmount)).toLocaleString()}
                    </strong>
                  </span>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-[#EAE3D6]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveAddExpenseMember(null);
                    setExpAmount('');
                    setExpDescription('');
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#57605B] hover:bg-[#EFE9DE] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!expAmount || isNaN(parseFloat(expAmount)) || parseFloat(expAmount) <= 0}
                  className="px-6 py-2.5 rounded-xl bg-[#183B32] disabled:opacity-40 text-[#FAF7F2] text-xs font-bold hover:bg-[#245246] transition-colors shadow-sm cursor-pointer"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-[#FAF7F2] border-b border-[#EAE3D6] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#C8963E]">
                Collaborative Budgeting
              </span>
              <h1 className="font-serif font-bold text-3xl sm:text-5xl text-[#183B32] mt-1 mb-2">
                Group Trips & Individual Expenses
              </h1>
              <p className="text-xs sm:text-sm text-[#57605B] max-w-xl leading-relaxed">
                Track individual budgets, log member spending cumulatively, and view comprehensive group totals in real time.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E2DACB] bg-[#FFFFFF] px-4 py-2.5 text-xs font-bold text-[#183B32] shadow-2xs self-start sm:self-auto">
              Currency: INR (₹)
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        
        {/* 4. OVERALL GROUP SUMMARY METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Card 1: Group Total Spent */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8C938E] uppercase tracking-wider">
                Group Total Spent
              </span>
              <Wallet className="w-4 h-4 text-[#183B32]" />
            </div>
            <div className="font-serif font-bold text-3xl sm:text-4xl text-[#183B32]">
              {currency}{groupTotalSpent.toLocaleString()}
            </div>
            <span className="text-xs text-[#57605B] block">
              Combined spending across {trip.members.length} companion{trip.members.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Card 2: Total Group Budget */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8C938E] uppercase tracking-wider">
                Total Planned Budget
              </span>
              <TrendingUp className="w-4 h-4 text-[#C8963E]" />
            </div>
            <div className="font-serif font-bold text-3xl sm:text-4xl text-[#C8963E]">
              {groupTotalBudget > 0 ? `${currency}${groupTotalBudget.toLocaleString()}` : 'Flexible'}
            </div>
            <span className="text-xs text-[#57605B] block">
              {groupTotalBudget > 0
                ? `${currency}${(groupTotalBudget - groupTotalSpent).toLocaleString()} total remaining`
                : 'No fixed group cap'}
            </span>
          </div>

          {/* Card 3: Total Logged Expenses */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8C938E] uppercase tracking-wider">
                Logged Expenses
              </span>
              <Receipt className="w-4 h-4 text-[#D96E37]" />
            </div>
            <div className="font-serif font-bold text-3xl sm:text-4xl text-[#D96E37]">
              {trip.expenses.length}
            </div>
            <span className="text-xs text-[#57605B] block">
              Individual transactions recorded
            </span>
          </div>
        </div>

        {/* 5. ADD MEMBER SECTION */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE0]">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#183B32] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#183B32]" />
                <span>Group Companions ({trip.members.length})</span>
              </h3>
              <p className="text-xs text-[#57605B] mt-0.5">
                Add each traveler with their optional planned budget.
              </p>
            </div>
          </div>

          {/* Add Member Form */}
          <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-[1.5fr,1fr,auto] gap-3 items-end">
            <div className="space-y-1">
              <label className="block font-bold text-[#183B32] uppercase tracking-wider text-[10px]">
                Member Name *
              </label>
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="e.g. Ayush, Rahul, Kavya..."
                required
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-xs text-[#202422] placeholder:text-[#8C938E] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-[#183B32] uppercase tracking-wider text-[10px]">
                Planned Budget ({currency}) <span className="text-[#8C938E] font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                step="any"
                value={newMemberBudget}
                onChange={(e) => setNewMemberBudget(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-xs text-[#202422] placeholder:text-[#8C938E] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={!newMemberName.trim()}
              className="px-6 py-3.5 rounded-2xl bg-[#183B32] hover:bg-[#245246] disabled:opacity-40 text-[#FAF7F2] text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </form>
        </div>

        {/* 6. INDIVIDUAL MEMBER CARDS (BUDGET + SPENT + ADD EXPENSE + EXPENSE HISTORY) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#183B32]">
              Individual Member Spending & Budgets
            </h2>
            <span className="text-xs text-[#57605B]">
              {trip.members.length} Member{trip.members.length === 1 ? '' : 's'}
            </span>
          </div>

          {trip.members.length === 0 ? (
            <div className="text-center py-16 px-6 bg-[#FFFFFF] rounded-3xl border border-dashed border-[#E2DACB] space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#183B32]/10 text-[#183B32] flex items-center justify-center mx-auto">
                <Users className="w-7 h-7 stroke-[1.5]" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#183B32]">No members added yet</h3>
              <p className="text-xs text-[#57605B] max-w-sm mx-auto">
                Add travel companions above (e.g. Ayush, Rahul) to track their individual budgets, log expenses, and see cumulative totals.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trip.members.map((member) => {
                const memberBudget = trip.memberBudgets?.[member];
                const hasBudget = typeof memberBudget === 'number' && memberBudget > 0;
                const totalSpent = memberSpentMap[member] || 0;
                const remaining = hasBudget ? memberBudget - totalSpent : null;
                const isOverBudget = hasBudget && remaining !== null && remaining < 0;

                // Member's individual expenses
                const memberExpenses = trip.expenses.filter((e) => e.paidBy === member);
                const isHistoryOpen = expandedHistories[member] ?? true; // Default open for clear visibility

                return (
                  <div
                    key={member}
                    className="bg-[#FFFFFF] rounded-3xl border border-[#E5DFD3] shadow-xs overflow-hidden flex flex-col justify-between"
                  >
                    {/* Member Card Header */}
                    <div className="p-6 pb-4 border-b border-[#F0EBE0] space-y-4">
                      
                      {/* Name & Actions */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#183B32] text-[#FAF7F2] font-serif font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                            {member.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-serif font-bold text-lg text-[#183B32]">
                              {member}
                            </h3>
                            <span className="text-[11px] text-[#8C938E]">
                              {memberExpenses.length} expense{memberExpenses.length === 1 ? '' : 's'} logged
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingMember({
                                oldName: member,
                                newName: member,
                                budget: memberBudget ? memberBudget.toString() : '',
                              })
                            }
                            className="p-2 rounded-xl text-[#8C938E] hover:text-[#183B32] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                            title="Edit name or budget"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setMemberToDelete(member)}
                            className="p-2 rounded-xl text-[#8C938E] hover:text-[#D96E37] hover:bg-[#FBEBE5] transition-colors cursor-pointer"
                            title={`Remove ${member}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Budget vs Spent Metric Bar */}
                      <div className="grid grid-cols-3 gap-2 p-3 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D6] text-center">
                        
                        {/* Budget */}
                        <div>
                          <span className="text-[10px] font-bold text-[#8C938E] uppercase tracking-wider block">
                            Budget
                          </span>
                          <span className="font-serif font-bold text-sm sm:text-base text-[#183B32]">
                            {hasBudget ? `${currency}${memberBudget.toLocaleString()}` : '—'}
                          </span>
                        </div>

                        {/* Total Spent */}
                        <div className="border-x border-[#EAE3D6] px-1">
                          <span className="text-[10px] font-bold text-[#8C938E] uppercase tracking-wider block">
                            Total Spent
                          </span>
                          <span className="font-serif font-bold text-sm sm:text-base text-[#D96E37]">
                            {currency}{totalSpent.toLocaleString()}
                          </span>
                        </div>

                        {/* Remaining */}
                        <div>
                          <span className="text-[10px] font-bold text-[#8C938E] uppercase tracking-wider block">
                            Remaining
                          </span>
                          {hasBudget && remaining !== null ? (
                            <span
                              className={`font-serif font-bold text-sm sm:text-base ${
                                isOverBudget ? 'text-[#C62828]' : 'text-[#2E7D32]'
                              }`}
                            >
                              {isOverBudget ? '-' : ''}
                              {currency}{Math.abs(remaining).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-xs text-[#8C938E] font-medium">—</span>
                          )}
                        </div>
                      </div>

                      {/* Add Expense Action Button */}
                      <button
                        type="button"
                        onClick={() => setActiveAddExpenseMember(member)}
                        className="w-full py-3 rounded-2xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-98 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-[#E0B466]" />
                        <span>+ Add Expense for {member}</span>
                      </button>
                    </div>

                    {/* Member's Individual Expense History */}
                    <div className="p-6 pt-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div
                          className="flex items-center justify-between cursor-pointer group"
                          onClick={() => toggleHistory(member)}
                        >
                          <h4 className="font-serif font-bold text-xs text-[#183B32] uppercase tracking-wider flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-[#C8963E]" />
                            <span>Expense History</span>
                          </h4>
                          <div className="flex items-center gap-1 text-[11px] text-[#8C938E] group-hover:text-[#183B32]">
                            <span>{memberExpenses.length} items</span>
                            {isHistoryOpen ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </div>

                        {isHistoryOpen && (
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {memberExpenses.length === 0 ? (
                              <div className="py-4 text-center text-[11px] text-[#8C938E] bg-[#FAF7F2] rounded-xl border border-dashed border-[#EAE3D6]">
                                No individual expenses logged yet. Tap "+ Add Expense" above.
                              </div>
                            ) : (
                              memberExpenses.map((exp) => (
                                <div
                                  key={exp.id}
                                  className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="min-w-0">
                                    <div className="font-bold text-[#183B32] truncate">
                                      {exp.title}
                                    </div>
                                    <div className="text-[10px] text-[#8C938E] flex items-center gap-1.5 mt-0.5">
                                      {exp.category && <span>{exp.category}</span>}
                                      <span>•</span>
                                      <span>{exp.date}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="font-serif font-bold text-sm text-[#183B32]">
                                      {currency}{exp.amount.toLocaleString()}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteExpense(exp.id)}
                                      className="p-1.5 rounded-lg text-[#8C938E] hover:text-[#D96E37] hover:bg-[#FBEBE5] transition-colors cursor-pointer"
                                      title="Delete expense"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* Cumulative Total Footer */}
                      <div className="mt-4 pt-3 border-t border-[#F0EBE0] flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#8C938E]">Total Spent:</span>
                        <span className="font-serif font-bold text-base text-[#183B32]">
                          {currency}{totalSpent.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 7. COMBINED MASTER EXPENSE LOG (OPTIONAL OVERVIEW) */}
        {trip.expenses.length > 0 && (
          <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE0]">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#183B32]">
                  Combined Group Transaction Feed
                </h3>
                <p className="text-xs text-[#57605B]">
                  All individual expenses across all members sorted chronologically.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#8C938E] uppercase tracking-wider block">
                  Grand Total
                </span>
                <span className="font-serif font-bold text-xl text-[#183B32]">
                  {currency}{groupTotalSpent.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="divide-y divide-[#F0EBE0]">
              {trip.expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="py-3 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#183B32]">{exp.title}</div>
                    <div className="text-[11px] text-[#57605B]">
                      Paid by <strong className="text-[#183B32]">{exp.paidBy}</strong> • {exp.date} {exp.category ? `• ${exp.category}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-sm text-[#183B32]">
                      {currency}{exp.amount.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1.5 rounded-lg text-[#8C938E] hover:text-[#D96E37] hover:bg-[#FBEBE5] transition-colors cursor-pointer"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
