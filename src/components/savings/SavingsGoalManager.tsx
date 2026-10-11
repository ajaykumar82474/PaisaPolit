// src/components/savings/SavingsGoalManager.tsx
import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';
import { formatRupee } from '../common/CurrencyDisplay';
import confetti from 'canvas-confetti';
import { 
  PiggyBank, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle, 
  X,
  History
} from 'lucide-react';

export const SavingsGoalManager: React.FC = () => {
  const { 
    state, 
    summary, 
    addSavingsGoal, 
    contributeToGoal, 
    deleteSavingsGoal, 
    startSimulation 
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contributeTargetGoal, setContributeTargetGoal] = useState<SavingsGoal | null>(null);
  const [contributeAmount, setContributeAmount] = useState<number>(500);

  // Add Goal Form states
  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState<number | ''>('');
  const [formInitialSaved, setFormInitialSaved] = useState<number | ''>(0);
  const [formTargetDay, setFormTargetDay] = useState<number>(30);
  const [formCategory, setFormCategory] = useState('Safety');
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setFormName('');
    setFormTarget('');
    setFormInitialSaved(0);
    setFormTargetDay(30);
    setFormCategory('Safety');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Please enter a goal name');
      return;
    }
    if (!formTarget || formTarget <= 0) {
      setFormError('Target amount must be greater than ₹0');
      return;
    }

    addSavingsGoal({
      name: formName.trim(),
      targetAmount: Number(formTarget),
      currentAmount: Number(formInitialSaved) || 0,
      targetDay: Number(formTargetDay),
      category: formCategory,
    });
    setIsAddModalOpen(false);
  };

  const handleConfirmContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeTargetGoal || contributeAmount <= 0) return;

    if (contributeAmount > summary.discretionaryBalance) {
      alert(`Cannot contribute ₹${contributeAmount}: You only have ₹${summary.discretionaryBalance} available in discretionary funds!`);
      return;
    }

    const success = contributeToGoal(contributeTargetGoal.id, contributeAmount, 'User manual allocation');
    if (success) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#6366F1', '#A855F7', '#10E57A']
        });
      } catch (_e) {
        // Ignore in environments without canvas
      }
      setContributeTargetGoal(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-900 border border-navy-750 p-6 rounded-2xl shadow-card-dark">
        <div>
          <div className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Savings Goals — Protect the Future
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Money saved is safely isolated from everyday spending. Total wealth is preserved without double-counting expenses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Protected Savings</div>
            <div className="text-lg font-mono font-bold text-indigo-400">
              {formatRupee(summary.protectedSavings)}
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-glow-sim"
          >
            <Plus className="w-4 h-4" />
            <span>Create Goal</span>
          </button>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {state.savingsGoals.map(goal => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isAchieved = goal.currentAmount >= goal.targetAmount;
          const isFeasible = summary.discretionaryBalance >= remaining;

          return (
            <div 
              key={goal.id} 
              className={`p-6 rounded-2xl border bg-navy-900 shadow-card-dark flex flex-col justify-between transition-all ${
                isAchieved ? 'border-brand-lime/40 bg-brand-lime/5' : 'border-navy-750'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                      Target: Day {goal.targetDay}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">{goal.name}</h3>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Target</div>
                    <div className="text-lg font-bold font-mono text-white">
                      {formatRupee(goal.targetAmount)}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="my-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">
                      Saved: <strong className="font-mono text-indigo-300">{formatRupee(goal.currentAmount)}</strong>
                    </span>
                    <span className="font-mono font-bold text-white">{pct}%</span>
                  </div>
                  <div className="h-3 w-full bg-navy-950 rounded-full overflow-hidden p-0.5 border border-navy-800">
                    <div 
                      style={{ width: `${pct}%` }} 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAchieved ? 'bg-brand-lime shadow-glow-lime' : 'bg-gradient-to-r from-indigo-500 to-brand-simLight'
                      }`}
                    />
                  </div>
                </div>

                {/* Feasibility Indicator */}
                <div className="p-3 rounded-xl bg-navy-950 border border-navy-850 text-xs">
                  {isAchieved ? (
                    <div className="flex items-center gap-2 text-brand-lime font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Goal Target Achieved! Funds remain protected.</span>
                    </div>
                  ) : isFeasible ? (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Sparkles className="w-4 h-4 text-brand-lime" />
                      <span>
                        Feasible: <strong className="text-white">{formatRupee(remaining)}</strong> needed; you have {formatRupee(summary.discretionaryBalance)} available.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        Constrained: Needs {formatRupee(remaining)}, exceeding current discretionary buffer ({formatRupee(summary.discretionaryBalance)}).
                      </span>
                    </div>
                  )}
                </div>

                {/* Contribution History Snippet */}
                {goal.contributions.length > 0 && (
                  <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-2">
                    <History className="w-3.5 h-3.5" />
                    <span>{goal.contributions.length} contribution(s) recorded • Last on Day {goal.contributions[0].day}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-navy-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    startSimulation({
                      type: 'savings_contribution',
                      title: `Contribute to ${goal.name}`,
                      amount: 500,
                      day: state.currentDay,
                      category: 'Other',
                    });
                  }}
                  className="text-xs text-brand-simLight hover:underline font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate in Lens</span>
                </button>

                <div className="flex items-center gap-2">
                  {!isAchieved && (
                    <button
                      onClick={() => {
                        setContributeTargetGoal(goal);
                        setContributeAmount(Math.min(500, summary.discretionaryBalance > 0 ? summary.discretionaryBalance : 500));
                      }}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors shadow-glow-sim"
                    >
                      + Contribute
                    </button>
                  )}
                  <button
                    onClick={() => deleteSavingsGoal(goal.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove goal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contribute Modal */}
      {contributeTargetGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-navy-900 border border-navy-700 w-full max-w-sm rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
              <h3 className="text-base font-bold text-white">
                Contribute to "{contributeTargetGoal.name}"
              </h3>
              <button onClick={() => setContributeTargetGoal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmContribution} className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                This safely transfers money from your Available Discretionary Balance into Protected Savings.
              </p>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Contribution Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, summary.discretionaryBalance)}
                  value={contributeAmount}
                  onChange={e => setContributeAmount(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-navy-800 rounded-lg px-3 py-2 font-mono text-base font-bold text-white focus:outline-none focus:border-indigo-500"
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  Available to transfer: <strong className="text-brand-lime">{formatRupee(summary.discretionaryBalance)}</strong>
                </div>
              </div>

              <div className="flex gap-2">
                {[200, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setContributeAmount(amt)}
                    className="flex-1 py-1.5 bg-navy-950 hover:bg-navy-800 rounded text-slate-300 text-xs font-mono border border-navy-800"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setContributeTargetGoal(null)}
                  className="px-4 py-2 bg-navy-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-lime hover:bg-brand-limeHover text-navy-950 font-bold rounded-lg shadow-glow-lime"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-navy-900 border border-navy-700 w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
              <h3 className="text-base font-bold text-white">Create New Savings Goal</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Goal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Headphones, Goa Trip, Exam Books"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 2000"
                    value={formTarget}
                    onChange={e => setFormTarget(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-navy-950 border border-navy-800 rounded-lg px-3 py-2 font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Initial Deposit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formInitialSaved}
                    onChange={e => setFormInitialSaved(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-navy-950 border border-navy-800 rounded-lg px-3 py-2 font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Day (1-30)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formTargetDay}
                  onChange={e => setFormTargetDay(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-navy-800 rounded-lg px-3 py-2 font-mono text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-navy-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-glow-sim"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
