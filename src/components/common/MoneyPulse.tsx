// src/components/common/MoneyPulse.tsx
import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupee } from './CurrencyDisplay';
import { 
  Wallet, 
  ShieldCheck, 
  PiggyBank, 
  CheckCircle2, 
  AlertTriangle, 
  Info
} from 'lucide-react';

export const MoneyPulse: React.FC = () => {
  const { summary } = useFinance();
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  const totalFunds = summary.initialBudget + summary.totalIncome;
  
  // Percentages for the proportional flow bar
  const spentPct = totalFunds > 0 ? Math.min(100, Math.max(0, (summary.totalExpenses / totalFunds) * 100)) : 0;
  const commitmentsPct = totalFunds > 0 ? Math.min(100, Math.max(0, (summary.unpaidCommitments / totalFunds) * 100)) : 0;
  const savingsPct = totalFunds > 0 ? Math.min(100, Math.max(0, (summary.protectedSavings / totalFunds) * 100)) : 0;
  const discretionaryPct = totalFunds > 0 ? Math.max(0, (summary.discretionaryBalance / totalFunds) * 100) : 0;

  return (
    <div className="bg-navy-900 border border-navy-750/80 rounded-2xl p-6 shadow-card-dark relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-lime/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-brand-sim/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-brand-lime animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-brand-lime">
              The Visual Signature
            </span>
            <span className="text-xs text-slate-400 font-mono">Day {summary.currentDay}/30</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            Money Pulse™
            <span className="text-xs bg-navy-800 text-slate-300 px-2 py-0.5 rounded-full font-normal border border-navy-700">
              Coordinated Financial Flow
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-navy-850 px-3 py-1.5 rounded-lg border border-navy-750">
          <Info className="w-3.5 h-3.5 text-brand-lime" />
          <span>Every Rupee accounted for: B₀ + I − E − S − C = D</span>
        </div>
      </div>

      {/* Proportional Segmented Flow Bar */}
      <div className="mb-6">
        <div className="h-5 w-full bg-navy-950 rounded-full overflow-hidden flex p-1 border border-navy-750">
          {/* Spent */}
          <div 
            style={{ width: `${spentPct}%` }}
            onMouseEnter={() => setActiveSegment('spent')}
            onMouseLeave={() => setActiveSegment(null)}
            className="h-full bg-rose-500 hover:brightness-125 transition-all duration-300 rounded-l cursor-pointer relative group"
            title={`Spent: ${formatRupee(summary.totalExpenses)} (${Math.round(spentPct)}%)`}
          />
          {/* Commitments */}
          <div 
            style={{ width: `${commitmentsPct}%` }}
            onMouseEnter={() => setActiveSegment('commitments')}
            onMouseLeave={() => setActiveSegment(null)}
            className="h-full bg-amber-500 hover:brightness-125 transition-all duration-300 cursor-pointer relative group"
            title={`Reserved Commitments: ${formatRupee(summary.unpaidCommitments)} (${Math.round(commitmentsPct)}%)`}
          />
          {/* Savings */}
          <div 
            style={{ width: `${savingsPct}%` }}
            onMouseEnter={() => setActiveSegment('savings')}
            onMouseLeave={() => setActiveSegment(null)}
            className="h-full bg-indigo-500 hover:brightness-125 transition-all duration-300 cursor-pointer relative group"
            title={`Protected Savings: ${formatRupee(summary.protectedSavings)} (${Math.round(savingsPct)}%)`}
          />
          {/* Available Discretionary */}
          <div 
            style={{ width: `${discretionaryPct}%` }}
            onMouseEnter={() => setActiveSegment('discretionary')}
            onMouseLeave={() => setActiveSegment(null)}
            className="h-full bg-brand-lime hover:brightness-110 transition-all duration-300 rounded-r cursor-pointer relative group shadow-glow-lime"
            title={`Available Discretionary: ${formatRupee(summary.discretionaryBalance)} (${Math.round(discretionaryPct)}%)`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Spent ({Math.round(spentPct)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Reserved Commitments ({Math.round(commitmentsPct)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            <span>Protected Savings ({Math.round(savingsPct)}%)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-brand-lime">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-lime inline-block" />
            <span>Available Runway ({Math.round(discretionaryPct)}%)</span>
          </div>
        </div>
      </div>

      {/* Connected Financial Nodes Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Node 1: Starting Budget */}
        <div 
          className={`p-3.5 rounded-xl border transition-all ${
            activeSegment === 'budget' ? 'border-slate-400 bg-navy-800' : 'border-navy-750 bg-navy-850/70 hover:border-navy-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-slate-300" />
              Starting Funds
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {formatRupee(summary.initialBudget + summary.totalIncome)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ₹10k base {summary.totalIncome > 0 ? `+ ₹${summary.totalIncome} extra` : ''}
          </div>
        </div>

        {/* Node 2: Money Spent */}
        <div 
          className={`p-3.5 rounded-xl border transition-all ${
            activeSegment === 'spent' ? 'border-rose-400 bg-rose-950/30' : 'border-navy-750 bg-navy-850/70 hover:border-navy-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-400 mb-1">
            <span>Money Spent</span>
            <span className="text-[10px] bg-rose-500/20 px-1.5 py-0.2 rounded text-rose-300">Outflow</span>
          </div>
          <div className="text-lg font-bold font-mono text-rose-400">
            -{formatRupee(summary.totalExpenses)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across recorded expenses
          </div>
        </div>

        {/* Node 3: Commitments */}
        <div 
          className={`p-3.5 rounded-xl border transition-all ${
            activeSegment === 'commitments' ? 'border-amber-400 bg-amber-950/30' : 'border-navy-750 bg-navy-850/70 hover:border-navy-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-400 mb-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Commitments
            </span>
            <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded text-amber-300">Reserved</span>
          </div>
          <div className="text-lg font-bold font-mono text-amber-400">
            -{formatRupee(summary.unpaidCommitments)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Promised for rent & bills
          </div>
        </div>

        {/* Node 4: Protected Savings */}
        <div 
          className={`p-3.5 rounded-xl border transition-all ${
            activeSegment === 'savings' ? 'border-indigo-400 bg-indigo-950/30' : 'border-navy-750 bg-navy-850/70 hover:border-navy-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-indigo-400 mb-1">
            <span className="flex items-center gap-1">
              <PiggyBank className="w-3.5 h-3.5" />
              Protected
            </span>
            <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.2 rounded text-indigo-300">Goals</span>
          </div>
          <div className="text-lg font-bold font-mono text-indigo-400">
            {formatRupee(summary.protectedSavings)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Locked in savings goals
          </div>
        </div>

        {/* Node 5: Available Discretionary */}
        <div 
          className={`p-3.5 rounded-xl border col-span-2 md:col-span-1 transition-all ${
            summary.isShortfall
              ? 'border-brand-coral bg-rose-950/40 text-brand-coral'
              : 'border-brand-lime/40 bg-brand-lime/10 shadow-glow-lime'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={`font-semibold flex items-center gap-1 ${summary.isShortfall ? 'text-brand-coral' : 'text-brand-lime'}`}>
              {summary.isShortfall ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Available
            </span>
            <span className="text-[10px] bg-brand-lime/20 text-brand-lime px-1.5 py-0.2 rounded font-mono">
              ₹{Math.round(summary.dailyAllowance)}/d
            </span>
          </div>
          <div className={`text-xl font-extrabold font-mono ${summary.isShortfall ? 'text-brand-coral' : 'text-brand-lime'}`}>
            {formatRupee(summary.discretionaryBalance)}
          </div>
          <div className="text-[11px] text-slate-300 mt-1">
            {summary.isShortfall ? 'Deficit shortfall' : `Safe to spend over ${summary.remainingDays}d`}
          </div>
        </div>
      </div>

      {/* Projection Bottom Strip */}
      <div className="mt-4 pt-3 border-t border-navy-750 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Projected Day-30 Ending Wealth:</span>
          <span className="font-mono font-bold text-white text-sm">
            {formatRupee(summary.projectedEndBalance)}
          </span>
          <span className="text-slate-400 text-[11px]">
            (Protected savings preserved)
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <span>Formula:</span>
          <code className="text-slate-300 bg-navy-950 px-2 py-0.5 rounded font-mono text-[11px]">
            ₹{summary.ledgerBalance} - ₹{summary.protectedSavings} - ₹{summary.unpaidCommitments} = ₹{summary.discretionaryBalance}
          </code>
        </div>
      </div>
    </div>
  );
};
