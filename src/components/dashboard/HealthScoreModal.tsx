// src/components/dashboard/HealthScoreModal.tsx
import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X, Activity, CheckCircle } from 'lucide-react';

interface HealthScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HealthScoreModal: React.FC<HealthScoreModalProps> = ({ isOpen, onClose }) => {
  const { summary } = useFinance();

  if (!isOpen) return null;

  const { healthScore, riskLevel, riskReason } = summary;
  const { factors, recommendations, tier, totalScore } = healthScore;

  const tierColors = {
    Thriving: 'text-brand-lime bg-brand-lime/10 border-brand-lime/30',
    Stable: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    Cautious: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Critical: 'text-brand-coral bg-brand-coral/10 border-brand-coral/30',
  }[tier];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-navy-900 border border-navy-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-navy-800 bg-navy-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-lime/10 border border-brand-lime/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-brand-lime" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Financial Health Breakdown</h3>
              <p className="text-xs text-slate-400">
                Transparent 100-point educational budgeting model
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Score Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-navy-950 border border-navy-800">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-black font-mono text-white flex items-baseline">
                {totalScore}
                <span className="text-base text-slate-500 font-normal">/100</span>
              </div>
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${tierColors}`}>
                  {tier} Trajectory
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Risk Status: <span className="text-slate-200 capitalize font-medium">{riskLevel}</span>
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400 max-w-xs text-right sm:text-right text-center">
              {riskReason}
            </div>
          </div>

          {/* 5 Factors Breakdown */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider text-slate-400">
              Scoring Factors (100 Points Total)
            </h4>
            <div className="space-y-3">
              {Object.entries(factors).map(([key, factor]) => {
                const pct = (factor.score / factor.max) * 100;
                return (
                  <div key={key} className="p-3.5 rounded-xl bg-navy-850/60 border border-navy-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="text-sm font-semibold text-slate-200">{factor.label}</span>
                        <p className="text-xs text-slate-400">{factor.desc}</p>
                      </div>
                      <div className="text-sm font-mono font-bold text-white text-right">
                        {factor.score}
                        <span className="text-slate-500 font-normal text-xs">/{factor.max}</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 w-full bg-navy-950 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 80 ? 'bg-brand-lime' : pct >= 50 ? 'bg-amber-400' : 'bg-brand-coral'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider text-slate-400">
              Actionable Recommendations
            </h4>
            <div className="space-y-2">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-navy-950 border border-navy-800 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-brand-lime shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclosure */}
          <div className="p-3 rounded-lg bg-navy-950/50 border border-navy-850 text-[11px] text-slate-500">
            Note: This score is a deterministic educational budgeting heuristic based on your ₹10,000 / 30-day runway. It does not represent a credit score or formal financial advice.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-navy-800 bg-navy-850/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-navy-800 hover:bg-navy-750 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
