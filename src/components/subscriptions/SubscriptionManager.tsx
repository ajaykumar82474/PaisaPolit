// src/components/subscriptions/SubscriptionManager.tsx
import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Subscription, Category } from '../../types/finance';
import { formatRupee } from '../common/CurrencyDisplay';
import { 
  Repeat, 
  Plus, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Calendar, 
  X
} from 'lucide-react';

const CATEGORIES: Category[] = [
  'Food & Chai',
  'Metro & Transport',
  'College & Books',
  'Mobile & Wifi',
  'Entertainment & OTT',
  'Shopping & Fashion',
  'Healthcare',
  'Emergency',
  'Other',
];

export const SubscriptionManager: React.FC = () => {
  const { 
    state, 
    addSubscription, 
    editSubscription, 
    toggleSubscription, 
    deleteSubscription, 
    startSimulation 
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState<number | ''>('');
  const [formBillingDay, setFormBillingDay] = useState<number>(15);
  const [formCategory, setFormCategory] = useState<Category>('Entertainment & OTT');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const activeSubs = state.subscriptions.filter(s => s.isActive);
  const totalMonthlyCost = activeSubs.reduce((sum, s) => sum + s.amount, 0);

  // Subscriptions due in the remaining days of the current period
  const futureSubsInPeriod = activeSubs.filter(
    s => s.billingDay >= state.currentDay && s.billingDay <= state.totalDays
  );
  const futureCostInPeriod = futureSubsInPeriod.reduce((sum, s) => sum + s.amount, 0);

  const handleOpenAdd = () => {
    setFormName('');
    setFormAmount('');
    setFormBillingDay(15);
    setFormCategory('Entertainment & OTT');
    setFormNotes('');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: Subscription) => {
    setEditingSub(s);
    setFormName(s.name);
    setFormAmount(s.amount);
    setFormBillingDay(s.billingDay);
    setFormCategory(s.category);
    setFormNotes(s.notes || '');
    setFormError(null);
  };

  const handleSaveSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Please enter subscription name');
      return;
    }
    if (!formAmount || formAmount <= 0) {
      setFormError('Amount must be greater than ₹0');
      return;
    }

    if (editingSub) {
      editSubscription(editingSub.id, {
        name: formName.trim(),
        amount: Number(formAmount),
        billingDay: Number(formBillingDay),
        category: formCategory,
        notes: formNotes.trim() || undefined,
      });
      setEditingSub(null);
    } else {
      addSubscription({
        name: formName.trim(),
        amount: Number(formAmount),
        billingFrequency: 'monthly',
        billingDay: Number(formBillingDay),
        category: formCategory,
        isActive: true,
        notes: formNotes.trim() || undefined,
      });
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-900 border border-navy-750 p-6 rounded-2xl shadow-card-dark">
        <div>
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Subscriptions — Small Charges, Visible Consequences
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Recurring monthly charges creep up quietly. Monitor your active commitments and simulate cancellations or additions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Remaining Period Cost</div>
            <div className="text-lg font-mono font-bold text-cyan-400">
              {formatRupee(futureCostInPeriod)}
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-navy-900 border border-navy-750">
          <div className="text-xs text-slate-400">Active Subscriptions</div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {activeSubs.length} services
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across OTT, tools, and music</div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-navy-750">
          <div className="text-xs text-slate-400">Total Monthly Cost</div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
            {formatRupee(totalMonthlyCost)}/mo
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {Math.round((totalMonthlyCost / state.initialBudget) * 100)}% of your ₹10k budget
          </div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-navy-750 flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-400">Test a New Subscription?</div>
            <div className="text-xs text-slate-300 mt-1">Preview before swiping your card</div>
          </div>
          <button
            onClick={() => {
              startSimulation({
                type: 'new_subscription',
                title: 'Netflix Standard (New)',
                amount: 199,
                day: state.currentDay,
                category: 'Entertainment & OTT',
              });
            }}
            className="mt-2 text-xs text-brand-simLight hover:underline font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate in Decision Lens</span>
          </button>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.subscriptions.map(sub => {
          const isDueSoon = sub.isActive && sub.billingDay >= state.currentDay && sub.billingDay <= state.currentDay + 5;
          const isPastThisCycle = sub.billingDay < state.currentDay;

          return (
            <div 
              key={sub.id} 
              className={`p-5 rounded-2xl border bg-navy-900 shadow-card-dark flex flex-col justify-between transition-all ${
                !sub.isActive ? 'border-navy-800 opacity-60' : 'border-navy-750'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{sub.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                        sub.isActive 
                          ? 'text-brand-lime bg-brand-lime/10 border-brand-lime/30' 
                          : 'text-slate-500 bg-navy-800 border-navy-700'
                      }`}>
                        {sub.isActive ? 'Active' : 'Paused'}
                      </span>
                      {isDueSoon && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                          Due soon
                        </span>
                      )}
                    </div>
                    {sub.notes && <p className="text-xs text-slate-400 mt-1">{sub.notes}</p>}
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold font-mono text-cyan-400">
                      {formatRupee(sub.amount)}
                      <span className="text-xs font-normal text-slate-400 font-sans ml-1">/mo</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{sub.category}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Bills on Day {sub.billingDay} of 30 {isPastThisCycle ? '(Charged this cycle)' : '(Upcoming charge)'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-4 border-t border-navy-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleSubscription(sub.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    sub.isActive
                      ? 'bg-navy-800 hover:bg-navy-750 text-slate-300 border-navy-700'
                      : 'bg-brand-lime/20 text-brand-lime border-brand-lime/40'
                  }`}
                >
                  {sub.isActive ? 'Pause / Cancel' : 'Reactivate'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(sub)}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-navy-800 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteSubscription(sub.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-navy-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Subscription Modal */}
      {(isAddModalOpen || editingSub) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-navy-900 border border-navy-700 w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
              <h3 className="text-base font-bold text-white">
                {editingSub ? 'Edit Subscription' : 'Add Monthly Subscription'}
              </h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditingSub(null); }} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSub} className="space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Prime Video, Gym, ChatGPT Plus"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Monthly Cost (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 199"
                  value={formAmount}
                  onChange={e => setFormAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-navy-950 border border-navy-800 rounded-lg px-3 py-2 font-mono text-sm font-bold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Billing Day (1-30)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formBillingDay}
                    onChange={e => setFormBillingDay(Number(e.target.value))}
                    className="w-full bg-navy-950 border border-navy-800 rounded-lg px-2.5 py-2 font-mono text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as Category)}
                    className="w-full bg-navy-950 border border-navy-800 rounded-lg px-2.5 py-2 text-white focus:outline-none"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Student plan renewal"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingSub(null); }}
                  className="px-4 py-2 bg-navy-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-lg shadow-lg"
                >
                  {editingSub ? 'Save Changes' : 'Add Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
