// src/components/commitments/CommitmentManager.tsx
import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Commitment, Category } from '../../types/finance';
import { formatRupee } from '../common/CurrencyDisplay';
import { 
  ShieldAlert, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  Info,
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

export const CommitmentManager: React.FC = () => {
  const { 
    state, 
    summary, 
    addCommitment, 
    editCommitment, 
    deleteCommitment, 
    payCommitment, 
    cancelCommitment 
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCommitment, setEditingCommitment] = useState<Commitment | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState<number | ''>('');
  const [formDueDay, setFormDueDay] = useState<number>(15);
  const [formCategory, setFormCategory] = useState<Category>('Other');
  const [formNotes, setFormNotes] = useState('');
  const [formIsRecurring, setFormIsRecurring] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const pendingCommitments = state.commitments.filter(c => c.status === 'pending' || c.status === 'overdue');
  const resolvedCommitments = state.commitments.filter(c => c.status === 'paid' || c.status === 'cancelled');

  const handleOpenAdd = () => {
    setFormTitle('');
    setFormAmount('');
    setFormDueDay(Math.min(30, state.currentDay + 5));
    setFormCategory('Other');
    setFormNotes('');
    setFormIsRecurring(false);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: Commitment) => {
    setEditingCommitment(c);
    setFormTitle(c.title);
    setFormAmount(c.amount);
    setFormDueDay(c.dueDay);
    setFormCategory(c.category);
    setFormNotes(c.notes || '');
    setFormIsRecurring(!!c.isRecurring);
    setFormError(null);
  };

  const handleSaveCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please enter a commitment title');
      return;
    }
    if (!formAmount || formAmount <= 0) {
      setFormError('Please enter a valid amount');
      return;
    }

    if (editingCommitment) {
      editCommitment(editingCommitment.id, {
        title: formTitle.trim(),
        amount: Number(formAmount),
        dueDay: Number(formDueDay),
        category: formCategory,
        notes: formNotes.trim() || undefined,
        isRecurring: formIsRecurring,
      });
      setEditingCommitment(null);
    } else {
      addCommitment({
        title: formTitle.trim(),
        amount: Number(formAmount),
        dueDay: Number(formDueDay),
        dueDate: `Day ${formDueDay}`,
        category: formCategory,
        status: formDueDay < state.currentDay ? 'overdue' : 'pending',
        notes: formNotes.trim() || undefined,
        isRecurring: formIsRecurring,
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
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Commitments — Money Already Promised
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Reserved obligations (rent, fees, wifi bills) are protected from your available balance so you never run out of money when bills are due.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Reserved</div>
            <div className="text-lg font-mono font-bold text-amber-400">
              {formatRupee(summary.unpaidCommitments)}
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add Commitment</span>
          </button>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-750 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Why is this money reserved?</strong> Unpaid commitments subtract directly from your Available Discretionary Balance (<code className="text-amber-300 font-mono">D = B - S - C</code>). When you click <strong>"Pay Now"</strong>, the reservation is released and converted into a recorded expense without double subtraction.
        </p>
      </div>

      {/* Active Unpaid Commitments Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
            Active Reserved Obligations ({pendingCommitments.length})
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {formatRupee(summary.unpaidCommitments)} currently locked
          </span>
        </div>

        {pendingCommitments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingCommitments.map(c => {
              const isOverdue = c.dueDay < state.currentDay;
              const daysUntil = c.dueDay - state.currentDay;

              return (
                <div 
                  key={c.id} 
                  className={`p-5 rounded-2xl border bg-navy-900 shadow-card-dark flex flex-col justify-between transition-all ${
                    isOverdue ? 'border-brand-coral/50' : 'border-navy-750'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          isOverdue 
                            ? 'text-brand-coral bg-brand-coral/10 border-brand-coral/30' 
                            : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                        }`}>
                          {isOverdue ? 'Overdue' : daysUntil === 0 ? 'Due Today' : `Due in ${daysUntil} days (Day ${c.dueDay})`}
                        </span>
                        <h3 className="text-base font-bold text-white mt-2">{c.title}</h3>
                        {c.notes && <p className="text-xs text-slate-400 mt-0.5">{c.notes}</p>}
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold font-mono text-amber-400">
                          {formatRupee(c.amount)}
                        </div>
                        <span className="text-[10px] text-slate-400">{c.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-4 border-t border-navy-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-navy-850 transition-colors"
                        title="Edit commitment"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => cancelCommitment(c.id)}
                        className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded hover:bg-navy-850 transition-colors"
                        title="Cancel obligation and release reserved funds"
                      >
                        Cancel
                      </button>
                    </div>

                    <button
                      onClick={() => payCommitment(c.id)}
                      className="px-3.5 py-1.5 bg-brand-lime hover:bg-brand-limeHover text-navy-950 font-bold rounded-lg text-xs shadow-glow-lime flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Pay Now</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-navy-900 border border-navy-750 rounded-2xl">
            <CheckCircle2 className="w-8 h-8 text-brand-lime mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">All Commitments Paid!</h4>
            <p className="text-xs text-slate-400">No active obligations are holding back your discretionary runway.</p>
          </div>
        )}
      </div>

      {/* Resolved (Paid / Cancelled) History */}
      {resolvedCommitments.length > 0 && (
        <div className="space-y-3 pt-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
            Resolved Obligations ({resolvedCommitments.length})
          </h2>
          <div className="bg-navy-900 border border-navy-750 rounded-2xl divide-y divide-navy-800">
            {resolvedCommitments.map(c => (
              <div key={c.id} className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {c.status === 'paid' ? (
                    <CheckCircle2 className="w-4 h-4 text-brand-lime" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-500" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-200">{c.title}</div>
                    <div className="text-[10px] text-slate-500">
                      Due Day {c.dueDay} • Status: <span className="capitalize">{c.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="font-mono font-bold text-slate-300">
                    {formatRupee(c.amount)}
                  </div>
                  <button
                    onClick={() => deleteCommitment(c.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Commitment Modal */}
      {(isAddModalOpen || editingCommitment) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-navy-900 border border-navy-700 w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
              <h3 className="text-base font-bold text-white">
                {editingCommitment ? 'Edit Commitment' : 'Add Financial Commitment'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCommitment(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCommitment} className="space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PG Room Share, Wifi bill, Tuition EMI"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="e.g. 2500"
                  value={formAmount}
                  onChange={e => setFormAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-navy-950 border border-navy-800 rounded-lg px-3 py-2 font-mono text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Due Day (1-30)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formDueDay}
                    onChange={e => setFormDueDay(Number(e.target.value))}
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
                  placeholder="e.g. Paid directly to landlord on 15th"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCommitment(null);
                  }}
                  className="px-4 py-2 bg-navy-800 hover:bg-navy-750 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold rounded-lg"
                >
                  {editingCommitment ? 'Save Changes' : 'Reserve Commitment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
