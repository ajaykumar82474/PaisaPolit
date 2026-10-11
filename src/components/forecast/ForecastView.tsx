// src/components/forecast/ForecastView.tsx
import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupee } from '../common/CurrencyDisplay';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2
} from 'lucide-react';

export const ForecastView: React.FC = () => {
  const { state, summary, forecast } = useFinance();
  const [selectedScenario, setSelectedScenario] = useState<'all' | 'baseline' | 'best' | 'stress'>('all');
  const [inspectedDay, setInspectedDay] = useState<number>(state.currentDay);

  // Find min and max balance for SVG scale
  let minBal = 0;
  let maxBal = state.initialBudget * 1.1;

  forecast.forEach(pt => {
    if (pt.closingBalance < minBal) minBal = pt.closingBalance;
    if (pt.stressCaseBalance < minBal) minBal = pt.stressCaseBalance;
    if (pt.bestCaseBalance > maxBal) maxBal = pt.bestCaseBalance;
    if (pt.openingBalance > maxBal) maxBal = pt.openingBalance;
  });

  const range = Math.max(1000, maxBal - minBal);
  const chartHeight = 220;
  const chartWidth = 700;

  const getCoordinates = (day: number, balance: number) => {
    const x = ((day - 1) / 29) * (chartWidth - 40) + 20;
    const y = chartHeight - 20 - ((balance - minBal) / range) * (chartHeight - 40);
    return { x, y };
  };

  // Build SVG path strings
  const baselinePath = forecast.map((pt, idx) => {
    const { x, y } = getCoordinates(pt.day, pt.closingBalance);
    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const bestCasePath = forecast.map((pt, idx) => {
    const { x, y } = getCoordinates(pt.day, pt.bestCaseBalance);
    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const stressCasePath = forecast.map((pt, idx) => {
    const { x, y } = getCoordinates(pt.day, pt.stressCaseBalance);
    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Zero-line Y coordinate if minBal < 0
  const zeroY = chartHeight - 20 - ((0 - minBal) / range) * (chartHeight - 40);

  // Shortfall check
  const baselineShortfall = forecast.find(pt => pt.closingBalance < 0);
  const stressShortfall = forecast.find(pt => pt.stressCaseBalance < 0);

  const inspectedPoint = forecast.find(pt => pt.day === inspectedDay) || forecast[0];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-900 border border-navy-750 p-6 rounded-2xl shadow-card-dark">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-lime" />
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              30-Day Forward-Looking Forecast
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Cash trajectory across the 30-day period integrating actual spending run-rate, scheduled commitments, subscriptions, and stress scenarios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Projected End Balance</div>
            <div className="text-lg font-mono font-bold text-brand-lime">
              {formatRupee(summary.projectedEndBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Shortfall Notification if detected */}
      {baselineShortfall ? (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-brand-coral/40 flex items-start gap-3 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 text-brand-coral shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block font-bold">Deficit Alert on Day {baselineShortfall.day}</strong>
            At your current daily spending pace, baseline funds will be exhausted by Day {baselineShortfall.day}. Reduce discretionary purchases in Decision Lens to maintain positive runway.
          </div>
        </div>
      ) : stressShortfall ? (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-start gap-3 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block font-bold">Stress Resilience Warning</strong>
            Your baseline runway lasts 30 days, but a surprise expense of ₹1,200 on Day 20 would cause a shortfall on Day {stressShortfall.day}. Building an emergency cushion is recommended.
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-brand-lime/10 border border-brand-lime/30 flex items-center gap-3 text-xs text-brand-lime">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>All 30 days project positive cash balance with commitments and savings protected.</span>
        </div>
      )}

      {/* Interactive Chart Container */}
      <div className="bg-navy-900 border border-navy-750 p-6 rounded-2xl shadow-card-dark">
        {/* Chart Header & Scenario Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Trajectory Curves:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedScenario('all')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  selectedScenario === 'all' ? 'bg-navy-800 text-white border border-navy-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedScenario('baseline')}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  selectedScenario === 'baseline' ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2.5 h-0.5 bg-brand-lime inline-block" />
                Baseline
              </button>
              <button
                onClick={() => setSelectedScenario('best')}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  selectedScenario === 'best' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" />
                Prudent
              </button>
              <button
                onClick={() => setSelectedScenario('stress')}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  selectedScenario === 'stress' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
                Stress Test
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Modeled Day 1 through Day 30
          </div>
        </div>

        {/* SVG Graphic */}
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56 select-none">
            {/* Grid Lines */}
            <line x1="20" y1="20" x2={chartWidth - 20} y2="20" stroke="#1D2A4D" strokeDasharray="3 3" />
            <line x1="20" y1={chartHeight / 2} x2={chartWidth - 20} y2={chartHeight / 2} stroke="#1D2A4D" strokeDasharray="3 3" />
            <line x1="20" y1={chartHeight - 20} x2={chartWidth - 20} y2={chartHeight - 20} stroke="#1D2A4D" strokeDasharray="3 3" />

            {/* Zero Deficit Line if applicable */}
            {minBal < 0 && (
              <line 
                x1="20" 
                y1={zeroY} 
                x2={chartWidth - 20} 
                y2={zeroY} 
                stroke="#EF4444" 
                strokeWidth="1.5" 
                strokeDasharray="4 2" 
              />
            )}

            {/* Current Day Vertical Line */}
            {(() => {
              const { x } = getCoordinates(state.currentDay, summary.ledgerBalance);
              return (
                <g>
                  <line x1={x} y1="15" x2={x} y2={chartHeight - 15} stroke="#3D5288" strokeWidth="1.5" strokeDasharray="2 2" />
                  <text x={x} y="12" fill="#10E57A" fontSize="9" textAnchor="middle" fontWeight="bold">
                    Today (Day {state.currentDay})
                  </text>
                </g>
              );
            })()}

            {/* Best Case Line */}
            {(selectedScenario === 'all' || selectedScenario === 'best') && (
              <path d={bestCasePath} fill="none" stroke="#06B6D4" strokeWidth="2" strokeDasharray="4 2" opacity="0.85" />
            )}

            {/* Stress Test Line */}
            {(selectedScenario === 'all' || selectedScenario === 'stress') && (
              <path d={stressCasePath} fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 3" opacity="0.85" />
            )}

            {/* Baseline Line */}
            {(selectedScenario === 'all' || selectedScenario === 'baseline') && (
              <path d={baselinePath} fill="none" stroke="#10E57A" strokeWidth="2.5" />
            )}

            {/* Points / Hover Nodes */}
            {forecast.map(pt => {
              const { x, y } = getCoordinates(pt.day, pt.closingBalance);
              const isSelected = pt.day === inspectedDay;
              const hasEvents = pt.events.length > 0 && pt.events[0] !== 'Today';

              return (
                <g 
                  key={pt.day} 
                  className="cursor-pointer" 
                  onClick={() => setInspectedDay(pt.day)}
                >
                  {hasEvents && (
                    <circle cx={x} cy={y} r="5" fill="#F59E0B" opacity="0.3" className="animate-ping" />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 6 : hasEvents ? 4 : 2.5}
                    fill={isSelected ? '#10E57A' : hasEvents ? '#F59E0B' : '#64748B'}
                    stroke="#0B101E"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Inspected Day Detail Strip */}
        <div className="mt-5 p-4 rounded-xl bg-navy-950 border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                Day {inspectedPoint.day} Forecast Inspection
              </span>
              {inspectedPoint.day === state.currentDay && (
                <span className="text-[10px] bg-brand-lime/20 text-brand-lime font-bold px-2 py-0.2 rounded">
                  Current Day
                </span>
              )}
            </div>
            {inspectedPoint.events.length > 0 && (
              <div className="text-slate-400 mt-1 flex flex-wrap gap-2">
                {inspectedPoint.events.map((ev, i) => (
                  <span key={i} className="bg-navy-850 px-2 py-0.5 rounded text-[11px] text-amber-300 border border-navy-750">
                    {ev}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400 text-[11px]">Closing Balance:</span>
              <div className="font-mono font-bold text-base text-white">
                {formatRupee(inspectedPoint.closingBalance)}
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Stress Shocked:</span>
              <div className="font-mono font-bold text-base text-amber-400">
                {formatRupee(inspectedPoint.stressCaseBalance)}
              </div>
            </div>
          </div>
        </div>

        {/* Day Slider */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs text-slate-400 shrink-0">Scrub Day:</span>
          <input
            type="range"
            min="1"
            max="30"
            value={inspectedDay}
            onChange={e => setInspectedDay(Number(e.target.value))}
            className="w-full accent-brand-lime"
          />
          <span className="text-xs font-mono font-bold text-white shrink-0">Day {inspectedDay}</span>
        </div>
      </div>
    </div>
  );
};
