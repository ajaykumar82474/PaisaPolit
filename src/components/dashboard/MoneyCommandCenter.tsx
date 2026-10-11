// src/components/dashboard/MoneyCommandCenter.tsx
import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { MoneyPulse } from '../common/MoneyPulse';
import { formatRupee, CurrencyDisplay } from '../common/CurrencyDisplay';
import { HealthScoreModal } from './HealthScoreModal';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  PiggyBank, 
  Repeat, 
  Receipt, 
  Activity, 
  Clock,
  Compass
} from 'lucide-react';

export const MoneyCommandCenter: React.FC = () => {
  const { 
    state, 
    summary, 
    insights, 
    setActiveView, 
    startSimulation, 
    payCommitment 
  } = useFinance();

  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

  const riskColors = {
    low: 'text-brand-lime bg-brand-lime/10 border-brand-lime/30',
    moderate: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    high: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    critical: 'text-brand-coral bg-brand-coral/10 border-brand-coral/30',
  }[summary.riskLevel];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Hero Banner: Five Questions Answered */}
      <div className="flex flex-col lg:flex-row items-stretch gap-6">
        
        {/* Dominant Card: Discretionary Balance & Daily Allowance */}
        <div className="flex-1 bg-gradient-to-br from-navy-900 to-navy-850 border border-navy-750 rounded-2xl p-6 sm:p-8 shadow-card-dark relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-lime/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-brand-lime flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                Available Discretionary Balance
              </span>
              <span className="text-xs text-slate-400 font-mono bg-navy-950 px-2.5 py-1 rounded-full border border-navy-800">
                Ledger: {formatRupee(summary.ledgerBalance)}
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <CurrencyDisplay 
                amount={summary.discretionaryBalance} 
                size="4xl" 
                highlightShortfall={true}
              />
              <span className="text-xs text-slate-400 font-normal">
                {summary.isShortfall ? 'Deficit' : 'Safe to spend right now'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-2 max-w-lg leading-relaxed">
              This is your true discretionary runway after reserving <strong className="text-amber-400">{formatRupee(summary.unpaidCommitments)}</strong> for commitments and <strong className="text-indigo-400">{formatRupee(summary.protectedSavings)}</strong> for savings.
            </p>
          </div>

          {/* Daily Allowance & Pacing Sub-Bar */}
          <div className="mt-6 pt-5 border-t border-navy-750 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-lime/10 border border-brand-lime/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-brand-lime" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Daily Spending Allowance</div>
                <div className="text-xl font-bold font-mono text-white">
                  {formatRupee(summary.dailyAllowance)}
                  <span className="text-xs font-normal text-slate-400 font-sans ml-1">/ day</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400">Remaining Days</div>
              <div className="text-sm font-bold font-mono text-slate-200">
                {summary.remainingDays} days left in 30-day period
              </div>
            </div>
          </div>
        </div>

        {/* Health Score & Risk Indicator Card */}
        <div className="w-full lg:w-80 bg-navy-900 border border-navy-750 rounded-2xl p-6 shadow-card-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-brand-lime" />
                Financial Health
              </span>
              <button
                onClick={() => setIsHealthModalOpen(true)}
                className="text-xs text-brand-lime hover:underline font-semibold"
              >
                Inspect Factors
              </button>
            </div>

            {/* Score Ring / Bar */}
            <div className="flex items-center gap-4 my-3">
              <div className="relative w-18 h-18 flex items-center justify-center">
                <div className="text-3xl font-black font-mono text-white">
                  {summary.healthScore.totalScore}
                </div>
                <span className="text-[10px] text-slate-500 ml-0.5">/100</span>
              </div>
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${riskColors}`}>
                  {summary.healthScore.tier}
                </span>
                <div className="text-xs text-slate-400 mt-1">
                  Risk Level: <strong className="text-slate-200 capitalize">{summary.riskLevel}</strong>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              {summary.riskReason}
            </p>
          </div>

          {/* Quick Action into Decision Lens */}
          <div className="mt-6 pt-4 border-t border-navy-750">
            <button
              onClick={() => {
                startSimulation({
                  type: 'discretionary_purchase',
                  title: 'Discretionary Purchase',
                  amount: 1000,
                  day: state.currentDay,
                  category: 'Shopping & Fashion',
                });
              }}
              className="w-full bg-brand-sim hover:bg-purple-600 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-glow-sim transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Simulate Choice in Lens</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Signature Component: Money Pulse */}
      <div>
        <MoneyPulse />
      </div>

      {/* Smart Contextual Insights Strip */}
      {insights.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
              Context-Aware Decision Insights
            </span>
            <span>Deterministic Rules Based on Your State</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.slice(0, 2).map(item => (
              <div 
                key={item.id} 
                className="p-4 rounded-xl bg-navy-900 border border-navy-750 flex items-start justify-between gap-3 hover:border-navy-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      item.type === 'warning' ? 'bg-amber-400' : item.type === 'opportunity' ? 'bg-brand-lime' : 'bg-cyan-400'
                    }`} />
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {item.suggestedAction && (
                  <button
                    onClick={() => {
                      if (item.suggestedAction?.actionType === 'open_lens') setActiveView('lens');
                      else if (item.suggestedAction?.actionType === 'view_commitments') setActiveView('commitments');
                      else if (item.suggestedAction?.actionType === 'view_goals') setActiveView('savings');
                      else if (item.suggestedAction?.actionType === 'view_ledger') setActiveView('ledger');
                    }}
                    className="shrink-0 text-xs font-semibold text-brand-lime hover:underline flex items-center gap-1 bg-navy-850 px-2.5 py-1.5 rounded-lg border border-navy-750"
                  >
                    <span>{item.suggestedAction.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Triad Grid: Commitments, Goals, Subscriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Commitments Card */}
        <div className="bg-navy-900 border border-navy-750 rounded-2xl p-5 shadow-card-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Commitments</h3>
              </div>
              <button 
                onClick={() => setActiveView('commitments')} 
                className="text-xs text-brand-lime hover:underline"
              >
                Manage ({state.commitments.filter(c => c.status === 'pending').length})
              </button>
            </div>

            <div className="text-2xl font-bold font-mono text-amber-400 mb-1">
              {formatRupee(summary.unpaidCommitments)}
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Reserved for upcoming fixed payments
            </p>

            <div className="space-y-2">
              {state.commitments.slice(0, 2).map(c => (
                <div key={c.id} className="p-2.5 rounded-lg bg-navy-950 border border-navy-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-200">{c.title}</div>
                    <div className="text-[10px] text-slate-400">Due Day {c.dueDay} • {c.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-200">{formatRupee(c.amount)}</div>
                    {c.status === 'pending' && (
                      <button
                        onClick={() => payCommitment(c.id)}
                        className="text-[10px] text-brand-lime hover:underline font-semibold"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveView('commitments')}
            className="w-full mt-4 py-2 bg-navy-850 hover:bg-navy-800 text-slate-300 rounded-lg text-xs font-semibold border border-navy-750 transition-colors"
          >
            View All Commitments
          </button>
        </div>

        {/* Savings Goals Card */}
        <div className="bg-navy-900 border border-navy-750 rounded-2xl p-5 shadow-card-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Savings Goals</h3>
              </div>
              <button 
                onClick={() => setActiveView('savings')} 
                className="text-xs text-brand-lime hover:underline"
              >
                Manage ({state.savingsGoals.length})
              </button>
            </div>

            <div className="text-2xl font-bold font-mono text-indigo-400 mb-1">
              {formatRupee(summary.protectedSavings)}
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Protected wealth locked for targets
            </p>

            <div className="space-y-2">
              {state.savingsGoals.slice(0, 2).map(g => {
                const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                return (
                  <div key={g.id} className="p-2.5 rounded-lg bg-navy-950 border border-navy-800 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-slate-200 truncate">{g.name}</span>
                      <span className="font-mono text-slate-300 font-bold">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-navy-900 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className="h-full bg-indigo-500 rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setActiveView('savings')}
            className="w-full mt-4 py-2 bg-navy-850 hover:bg-navy-800 text-slate-300 rounded-lg text-xs font-semibold border border-navy-750 transition-colors"
          >
            View All Savings Goals
          </button>
        </div>

        {/* Subscriptions Card */}
        <div className="bg-navy-900 border border-navy-750 rounded-2xl p-5 shadow-card-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Subscriptions</h3>
              </div>
              <button 
                onClick={() => setActiveView('subscriptions')} 
                className="text-xs text-brand-lime hover:underline"
              >
                Manage ({state.subscriptions.filter(s => s.isActive).length})
              </button>
            </div>

            <div className="text-2xl font-bold font-mono text-cyan-400 mb-1">
              {formatRupee(state.subscriptions.filter(s => s.isActive).reduce((s, sub) => s + sub.amount, 0))}
              <span className="text-xs font-normal text-slate-400 font-sans ml-1">/ mo</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Recurring charges in 30-day window
            </p>

            <div className="space-y-2">
              {state.subscriptions.slice(0, 2).map(sub => (
                <div key={sub.id} className="p-2.5 rounded-lg bg-navy-950 border border-navy-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-200">{sub.name}</div>
                    <div className="text-[10px] text-slate-400">Bills on Day {sub.billingDay}</div>
                  </div>
                  <div className="font-mono font-bold text-slate-300">
                    {formatRupee(sub.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveView('subscriptions')}
            className="w-full mt-4 py-2 bg-navy-850 hover:bg-navy-800 text-slate-300 rounded-lg text-xs font-semibold border border-navy-750 transition-colors"
          >
            Manage Subscriptions
          </button>
        </div>

      </div>

      {/* Recent Ledger Activity Preview */}
      <div className="bg-navy-900 border border-navy-750 rounded-2xl p-6 shadow-card-dark">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-lime" />
              Recent Spending Ledger
            </h3>
            <p className="text-xs text-slate-400">
              Latest transactions recorded within your 30-day budget
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('ledger')}
              className="text-xs font-semibold text-brand-lime hover:underline bg-navy-850 px-3 py-1.5 rounded-lg border border-navy-750"
            >
              Open Full Ledger
            </button>
          </div>
        </div>

        <div className="divide-y divide-navy-800">
          {state.transactions.slice(0, 4).map(tx => (
            <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${tx.type === 'expense' ? 'bg-rose-500' : 'bg-brand-lime'}`} />
                <div>
                  <div className="font-medium text-slate-200">{tx.description}</div>
                  <div className="text-[10px] text-slate-400">Day {tx.day} • {tx.category}</div>
                </div>
              </div>
              <div className={`font-mono font-bold text-sm ${tx.type === 'expense' ? 'text-rose-400' : 'text-brand-lime'}`}>
                {tx.type === 'expense' ? '-' : '+'}{formatRupee(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Score Detailed Modal */}
      <HealthScoreModal 
        isOpen={isHealthModalOpen} 
        onClose={() => setIsHealthModalOpen(false)} 
      />

    </div>
  );
};
