// src/components/landing/LandingHero.tsx
import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupee } from '../common/CurrencyDisplay';
import { 
  Sparkles, 
  ArrowRight, 
  Sliders, 
  TrendingUp, 
  Compass
} from 'lucide-react';

export const LandingHero: React.FC = () => {
  const { summary, setActiveView, startSimulation, state } = useFinance();

  return (
    <div className="space-y-16 py-8 animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <div className="relative text-center max-w-4xl mx-auto space-y-6 pt-6 sm:pt-12">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-lime/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-brand-sim/15 rounded-full blur-[90px] pointer-events-none" />

        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-900 border border-brand-lime/30 text-xs font-semibold text-brand-lime shadow-glow-lime">
          <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
          <span>The 30-Day Money Lab for Gen Z</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 font-mono">₹10,000 Budget Challenge</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
          Your money has 30 days.<br />
          <span className="bg-gradient-to-r from-brand-lime via-emerald-300 to-teal-400 bg-clip-text text-transparent">
            Preview the consequences
          </span> before you commit.
        </h1>

        {/* Subhead */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Not another passive expense tracker. PaisaPilot lets you simulate purchases, protect rent commitments, and stress-test your monthly cash runway before you swipe.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setActiveView('overview')}
            className="w-full sm:w-auto px-8 py-4 bg-brand-lime hover:bg-brand-limeHover text-navy-950 font-extrabold rounded-2xl text-sm transition-all shadow-glow-lime flex items-center justify-center gap-2 group"
          >
            <span>Enter Money Command Center</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => {
              startSimulation({
                type: 'discretionary_purchase',
                title: 'Weekend Music Fest Pass',
                amount: 1500,
                day: state.currentDay,
                category: 'Entertainment & OTT',
              });
            }}
            className="w-full sm:w-auto px-6 py-4 bg-navy-900 hover:bg-navy-850 text-white font-bold rounded-2xl text-sm border border-brand-sim/50 hover:border-brand-sim shadow-glow-sim transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-brand-simLight" />
            <span>Launch Decision Lens (Live Demo)</span>
          </button>
        </div>

        {/* Live Metrics Preview Bar */}
        <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
          <div className="p-3.5 rounded-xl bg-navy-900/80 border border-navy-800">
            <div className="text-[11px] text-slate-400">Monthly Budget</div>
            <div className="text-base font-bold font-mono text-white">₹10,000</div>
          </div>
          <div className="p-3.5 rounded-xl bg-navy-900/80 border border-navy-800">
            <div className="text-[11px] text-slate-400">Available Runway</div>
            <div className="text-base font-bold font-mono text-brand-lime">
              {formatRupee(summary.discretionaryBalance)}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-navy-900/80 border border-navy-800">
            <div className="text-[11px] text-slate-400">Daily Spending Cap</div>
            <div className="text-base font-bold font-mono text-white">
              {formatRupee(summary.dailyAllowance)}/d
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-navy-900/80 border border-navy-800">
            <div className="text-[11px] text-slate-400">Health Score</div>
            <div className="text-base font-bold font-mono text-cyan-400">
              {summary.healthScore.totalScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* The 5 Core Questions Feature Grid */}
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-lime">
            The Product Thesis
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Answers the 5 Crucial Financial Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-navy-900 border border-navy-750 shadow-card-dark space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-lime/10 border border-brand-lime/30 flex items-center justify-center text-brand-lime">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              1. How much money do I actually have?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We separate ledger balance from discretionary balance. Unpaid PG rent and savings goals are locked so you never accidentally spend promised money.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900 border border-navy-750 shadow-card-dark space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-sim/10 border border-brand-sim/30 flex items-center justify-center text-brand-simLight">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              2. What happens if I make this choice?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Decision Lens creates an isolated sandbox. Preview a ₹1,500 concert ticket or weekend road trip, see the exact drop in daily allowance, then commit or cancel.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900 border border-navy-750 shadow-card-dark space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              3. Will my cash last the full 30 days?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Forward-looking cash flow projections track remaining run-rate, scheduled subscriptions, and stress-tests sudden emergencies.
            </p>
          </div>
        </div>
      </div>

      {/* The Interaction Loop Callout */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-navy-750 max-w-4xl mx-auto text-center space-y-4">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          The Defining Loop
        </span>
        <div className="text-xl sm:text-2xl font-black text-white tracking-tight flex flex-wrap items-center justify-center gap-2">
          <span className="text-slate-300">DECISION</span>
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <span className="text-brand-simLight">SIMULATION</span>
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <span className="text-amber-400">CONSEQUENCE</span>
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <span className="text-cyan-400">COMPARISON</span>
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <span className="text-brand-lime">COMMIT OR CANCEL</span>
        </div>
        <div className="pt-2">
          <button
            onClick={() => setActiveView('overview')}
            className="px-6 py-2.5 bg-brand-lime text-navy-950 font-bold rounded-xl text-xs shadow-glow-lime hover:bg-brand-limeHover transition-all inline-flex items-center gap-2"
          >
            <span>Start Exploring PaisaPilot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
