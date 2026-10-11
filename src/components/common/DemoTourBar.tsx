// src/components/common/DemoTourBar.tsx
import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Sparkles, RotateCcw } from 'lucide-react';

export const DemoTourBar: React.FC = () => {
  const { 
    state, 
    startSimulation, 
    setScenarioAlternatives, 
    setActiveView, 
    payCommitment,
    resetToDemo 
  } = useFinance();

  const handleSimulateConcert = () => {
    startSimulation({
      type: 'discretionary_purchase',
      title: 'Zomato Live Music Fest VIP Pass',
      amount: 1500,
      day: state.currentDay,
      category: 'Entertainment & OTT',
      notes: 'Weekend music festival pass with friends'
    });
  };

  const handleCompareAlternatives = () => {
    startSimulation({
      type: 'discretionary_purchase',
      title: 'Zomato Live Music Fest VIP Pass',
      amount: 1500,
      day: state.currentDay,
      category: 'Entertainment & OTT',
    });
    setScenarioAlternatives([
      {
        id: 'alt-1',
        name: 'VIP Pass (Now)',
        tagline: 'Buy full ticket today',
        amount: 1500,
        day: state.currentDay,
        type: 'discretionary_purchase',
        category: 'Entertainment & OTT',
      },
      {
        id: 'alt-2',
        name: 'General Admission',
        tagline: 'Standard ticket (Save ₹750)',
        amount: 750,
        day: state.currentDay,
        type: 'discretionary_purchase',
        category: 'Entertainment & OTT',
      },
      {
        id: 'alt-3',
        name: 'Delay to Day 25',
        tagline: 'Buy last minute if budget permits',
        amount: 1500,
        day: 25,
        type: 'discretionary_purchase',
        category: 'Entertainment & OTT',
      }
    ]);
    setActiveView('lens');
  };

  const handlePayRent = () => {
    const rentCommitment = state.commitments.find(c => c.status === 'pending' && c.amount === 2500);
    if (rentCommitment) {
      payCommitment(rentCommitment.id);
    }
    setActiveView('commitments');
  };

  return (
    <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border-b border-brand-sim/30 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Badge & Intro */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 bg-brand-sim/20 text-brand-simLight font-bold px-2 py-0.5 rounded border border-brand-sim/40 uppercase tracking-wider text-[10px]">
            <Sparkles className="w-3 h-3 text-brand-simLight" />
            Hackathon Evaluator Tour
          </span>
          <span className="text-slate-300 font-medium hidden sm:inline">
            Interactive Test Path:
          </span>
        </div>

        {/* Step Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Step 1: Simulate */}
          <button
            onClick={handleSimulateConcert}
            className="flex items-center gap-1.5 bg-navy-800 hover:bg-navy-750 text-slate-200 hover:text-white px-2.5 py-1 rounded border border-navy-700 transition-colors"
            title="Prefill Decision Lens with ₹1,500 concert ticket"
          >
            <span className="text-brand-lime font-mono font-bold">1</span>
            <span>Simulate ₹1,500 Ticket</span>
          </button>

          {/* Step 2: Compare Alternatives */}
          <button
            onClick={handleCompareAlternatives}
            className="flex items-center gap-1.5 bg-brand-sim/20 hover:bg-brand-sim/30 text-purple-200 px-2.5 py-1 rounded border border-brand-sim/40 transition-colors"
            title="Side-by-side comparison of 3 options"
          >
            <span className="text-purple-300 font-mono font-bold">2</span>
            <span>Compare 3 Alternatives</span>
          </button>

          {/* Step 3: Pay Commitment */}
          <button
            onClick={handlePayRent}
            className="flex items-center gap-1.5 bg-navy-800 hover:bg-navy-750 text-slate-200 hover:text-white px-2.5 py-1 rounded border border-navy-700 transition-colors"
            title="Pay ₹2,500 PG Rent commitment to test ledger deduction"
          >
            <span className="text-amber-400 font-mono font-bold">3</span>
            <span>Pay PG Rent (₹2,500)</span>
          </button>

          {/* Reset Demo button */}
          <button
            onClick={resetToDemo}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-navy-800 transition-colors ml-1"
            title="Reset to Day 8 Hackathon Demo state"
          >
            <RotateCcw className="w-3 h-3 text-brand-lime" />
            <span>Reset Demo</span>
          </button>
        </div>

      </div>
    </div>
  );
};
