// src/components/lens/ScenarioComparator.tsx
import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupee } from '../common/CurrencyDisplay';
import { 
  ArrowLeft, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const ScenarioComparator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { 
    summary, 
    activeAlternatives, 
    alternativesResults, 
    startSimulation
  } = useFinance();

  if (activeAlternatives.length === 0 || alternativesResults.length === 0) {
    return (
      <div className="p-8 text-center bg-navy-900 border border-navy-750 rounded-2xl">
        <p className="text-slate-400 text-sm">No alternative scenarios active for comparison.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white rounded-lg text-xs"
        >
          Return to Simulation Lab
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-navy-900 border border-navy-750 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-navy-800 hover:bg-navy-750 text-slate-300 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-brand-simLight flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Scenario Comparison Matrix
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Compare Decision Alternatives Side-by-Side
            </h2>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono bg-navy-950 px-3 py-1.5 rounded-lg border border-navy-800">
          Baseline Discretionary: <strong className="text-brand-lime">{formatRupee(summary.discretionaryBalance)}</strong>
        </div>
      </div>

      {/* Alternatives Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {alternativesResults.map(({ alternative, consequence }, idx) => {
          const simSum = consequence.simulatedSummary;

          return (
            <div
              key={alternative.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                consequence.verdict === 'dangerous'
                  ? 'border-brand-coral/50 bg-rose-950/20'
                  : consequence.verdict === 'caution'
                  ? 'border-amber-500/50 bg-amber-950/20'
                  : 'border-brand-sim/60 bg-navy-900 shadow-glow-sim'
              }`}
            >
              <div>
                {/* Alternative Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Option {String.fromCharCode(65 + idx)}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    consequence.verdict === 'dangerous'
                      ? 'text-brand-coral bg-brand-coral/10 border-brand-coral/30'
                      : consequence.verdict === 'caution'
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                      : 'text-brand-lime bg-brand-lime/10 border-brand-lime/30'
                  }`}>
                    {consequence.verdict}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{alternative.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{alternative.tagline}</p>

                {/* Amount */}
                <div className="text-2xl font-black font-mono text-white mt-3">
                  {formatRupee(alternative.amount)}
                </div>

                {/* Impact Metrics */}
                <div className="mt-4 pt-4 border-t border-navy-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resulting Discretionary:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {formatRupee(simSum.discretionaryBalance)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Allowance:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {formatRupee(simSum.dailyAllowance)}/d
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Allowance Δ:</span>
                    <span className={`font-mono font-bold ${consequence.deltas.dailyAllowanceDelta >= 0 ? 'text-brand-lime' : 'text-rose-400'}`}>
                      {consequence.deltas.dailyAllowanceDelta >= 0 ? '+' : ''}{formatRupee(consequence.deltas.dailyAllowanceDelta)}/d
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Health Score:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {simSum.healthScore.totalScore}/100 ({consequence.deltas.healthScoreDelta >= 0 ? '+' : ''}{consequence.deltas.healthScoreDelta})
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Level:</span>
                    <span className="font-medium capitalize text-slate-200">
                      {simSum.riskLevel}
                    </span>
                  </div>
                </div>

                {/* Plain-Language Trade-Off */}
                <div className="mt-4 p-3 rounded-xl bg-navy-950/80 border border-navy-850 text-xs text-slate-300 leading-relaxed">
                  {consequence.verdictExplanation}
                </div>
              </div>

              {/* Action */}
              <div className="mt-6 pt-4 border-t border-navy-850">
                <button
                  onClick={() => {
                    startSimulation({
                      type: alternative.type,
                      title: alternative.name,
                      amount: alternative.amount,
                      day: alternative.day,
                      category: alternative.category,
                      notes: alternative.notes,
                    });
                    onBack();
                  }}
                  className="w-full py-2.5 px-3 bg-brand-sim hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-glow-sim"
                >
                  <span>Select & Apply Option {String.fromCharCode(65 + idx)}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
