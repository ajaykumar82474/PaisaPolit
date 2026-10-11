// src/components/lens/DecisionLens.tsx
import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { DecisionType, Category } from '../../types/finance';
import { formatRupee } from '../common/CurrencyDisplay';
import { ScenarioComparator } from './ScenarioComparator';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Sliders, 
  Layers, 
  Check, 
  Undo,
  Info
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

export const DecisionLens: React.FC = () => {
  const { 
    state, 
    summary, 
    activeSimulation, 
    simulationConsequence, 
    startSimulation, 
    updateSimulation, 
    cancelSimulation, 
    applySimulation, 
    undoLastApplied,
    setScenarioAlternatives,
    isApplyingSimulation 
  } = useFinance();

  const [isComparing, setIsComparing] = useState(false);
  const [justAppliedMessage, setJustAppliedMessage] = useState<string | null>(null);

  // Form local state if activeSimulation is null
  const [formType, setFormType] = useState<DecisionType>('discretionary_purchase');
  const [formTitle, setFormTitle] = useState('Weekend Concert & Dining');
  const [formAmount, setFormAmount] = useState<number>(1200);
  const [formCategory, setFormCategory] = useState<Category>('Entertainment & OTT');
  const [formDay, setFormDay] = useState<number>(state.currentDay);

  // Quick amount presets
  const presets = [350, 800, 1500, 2500, 3500];

  const handleSimulateClick = () => {
    startSimulation({
      type: formType,
      title: formTitle,
      amount: formAmount,
      category: formCategory,
      day: formDay,
    });
  };

  const handleApplyCommit = () => {
    if (!simulationConsequence) return;
    const title = activeSimulation?.title || 'Decision';
    const success = applySimulation();
    if (success) {
      // Trigger festive confetti
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10E57A', '#7C3AED', '#6366F1']
        });
      } catch (_e) {
        // Ignore in environments where canvas is unavailable
      }
      setJustAppliedMessage(`Applied "${title}" into active ledger! Financial state updated.`);
      setTimeout(() => setJustAppliedMessage(null), 5000);
    }
  };

  const handleOpenComparison = () => {
    if (!activeSimulation) return;
    setScenarioAlternatives([
      {
        id: 'alt-now',
        name: `${activeSimulation.title} (Immediate)`,
        tagline: 'Spend full amount today',
        amount: activeSimulation.amount,
        day: activeSimulation.day,
        type: activeSimulation.type,
        category: activeSimulation.category,
      },
      {
        id: 'alt-budget',
        name: `Budget Alternative (50%)`,
        tagline: 'Opt for thrift or lower tier',
        amount: Math.round(activeSimulation.amount * 0.5),
        day: activeSimulation.day,
        type: activeSimulation.type,
        category: activeSimulation.category,
      },
      {
        id: 'alt-delay',
        name: `Delay to Day ${Math.min(30, activeSimulation.day + 7)}`,
        tagline: 'Re-evaluate next week',
        amount: activeSimulation.amount,
        day: Math.min(30, activeSimulation.day + 7),
        type: activeSimulation.type,
        category: activeSimulation.category,
      }
    ]);
    setIsComparing(true);
  };

  if (isComparing) {
    return <ScenarioComparator onBack={() => setIsComparing(false)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-navy-900 border border-navy-750 rounded-2xl p-6 shadow-card-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-sim/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-sim animate-pulse" />
              <span className="text-xs uppercase font-bold tracking-wider text-brand-simLight">
                The Signature Feature
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
              Decision Lens™ — Financial Simulation Lab
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Preview financial choices before taking them. Compare consequences, protect commitments, and commit only when confident.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {state.appliedHistory.length > 0 && (
              <button
                onClick={undoLastApplied}
                className="flex items-center gap-1.5 px-3 py-2 bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-navy-700 transition-colors"
                title="Roll back the last applied decision"
              >
                <Undo className="w-3.5 h-3.5 text-amber-400" />
                <span>Undo Last Applied ({state.appliedHistory.length})</span>
              </button>
            )}

            <div className="text-xs text-slate-400 font-mono bg-navy-950 px-3 py-2 rounded-xl border border-navy-800">
              Current Baseline: <strong className="text-brand-lime">{formatRupee(summary.discretionaryBalance)}</strong>
            </div>
          </div>
        </div>

        {/* Feedback alert */}
        {justAppliedMessage && (
          <div className="mt-4 p-3 bg-brand-lime/10 border border-brand-lime/30 rounded-xl flex items-center justify-between text-xs text-brand-lime animate-in fade-in">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              {justAppliedMessage}
            </span>
            <button onClick={() => setJustAppliedMessage(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}
      </div>

      {/* Main Two-Column Simulation Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Simulation Inputs & Config (5 cols) */}
        <div className="lg:col-span-5 bg-navy-900 border border-navy-750 rounded-2xl p-6 shadow-card-dark space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-simLight" />
              Configure Financial Scenario
            </h2>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-navy-950 px-2 py-0.5 rounded border border-navy-800">
              Step 1 of 3
            </span>
          </div>

          {/* Decision Type Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Decision Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'discretionary_purchase', label: 'Discretionary Buy', sub: 'Shopping / Dining' },
                { id: 'unexpected_expense', label: 'Surprise Expense', sub: 'Repairs / Urgent' },
                { id: 'new_subscription', label: 'New Subscription', sub: 'Recurring OTT' },
                { id: 'savings_contribution', label: 'Savings Boost', sub: 'Protect for Goals' },
                { id: 'extra_income', label: 'Extra Income', sub: 'Freelance / Gift' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    const type = t.id as DecisionType;
                    setFormType(type);
                    if (activeSimulation) {
                      updateSimulation({ type });
                    }
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    (activeSimulation ? activeSimulation.type : formType) === t.id
                      ? 'border-brand-sim bg-brand-sim/15 text-white shadow-glow-sim'
                      : 'border-navy-750 bg-navy-850 hover:border-navy-700 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{t.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{t.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Decision Description
            </label>
            <input
              type="text"
              value={activeSimulation ? activeSimulation.title : formTitle}
              onChange={e => {
                const title = e.target.value;
                setFormTitle(title);
                if (activeSimulation) updateSimulation({ title });
              }}
              placeholder="e.g. Concert pass, new sneakers, freelance stipend"
              className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-sim"
            />
          </div>

          {/* Amount and Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400">
                Amount (₹ Rupees)
              </label>
              <span className="text-[10px] text-slate-400">Quick Presets</span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">₹</span>
              <input
                type="number"
                min="1"
                step="1"
                value={activeSimulation ? activeSimulation.amount : formAmount}
                onChange={e => {
                  const amount = Math.max(0, Number(e.target.value));
                  setFormAmount(amount);
                  if (activeSimulation) updateSimulation({ amount });
                }}
                className="w-full bg-navy-950 border border-navy-750 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-brand-sim"
              />
            </div>

            {/* Presets chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => {
                    setFormAmount(p);
                    if (activeSimulation) updateSimulation({ amount: p });
                  }}
                  className="px-2 py-1 bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white rounded-lg text-xs font-mono border border-navy-750 transition-colors"
                >
                  ₹{p}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Day Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={activeSimulation ? activeSimulation.category : formCategory}
                onChange={e => {
                  const cat = e.target.value as Category;
                  setFormCategory(cat);
                  if (activeSimulation) updateSimulation({ category: cat });
                }}
                className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-sim"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Simulated Day (1-30)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={activeSimulation ? activeSimulation.day : formDay}
                onChange={e => {
                  const day = Math.min(30, Math.max(1, Number(e.target.value)));
                  setFormDay(day);
                  if (activeSimulation) updateSimulation({ day });
                }}
                className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-sim"
              />
            </div>
          </div>

          {/* Action to trigger simulation if not active */}
          {!activeSimulation && (
            <button
              onClick={handleSimulateClick}
              className="w-full py-3 bg-brand-sim hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-glow-sim"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Simulate Decision in Lens</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {activeSimulation && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleOpenComparison}
                className="flex-1 py-2.5 px-3 bg-navy-800 hover:bg-navy-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-navy-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-brand-simLight" />
                <span>Compare 3 Alternatives</span>
              </button>
              <button
                onClick={cancelSimulation}
                className="py-2.5 px-3 bg-navy-950 hover:bg-navy-850 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold border border-navy-800 transition-colors"
                title="Discard simulation and return to baseline"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Before vs After Projection Lens (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Plan Status Header: Current Plan vs Simulated Plan */}
          <div className="bg-navy-900 border border-navy-750 rounded-2xl p-6 shadow-card-dark">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-navy-950 px-2.5 py-1 rounded-full border border-navy-800">
                  Step 2 of 3: Impact Analysis
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {activeSimulation ? 'Simulated Consequence Preview' : 'Baseline Reference Position'}
                </h3>
              </div>

              {activeSimulation && simulationConsequence && (
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  simulationConsequence.verdict === 'dangerous'
                    ? 'text-brand-coral bg-brand-coral/10 border-brand-coral/30'
                    : simulationConsequence.verdict === 'caution'
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                    : 'text-brand-lime bg-brand-lime/10 border-brand-lime/30'
                }`}>
                  {simulationConsequence.verdict === 'dangerous' && <AlertTriangle className="w-3.5 h-3.5" />}
                  {simulationConsequence.verdict === 'caution' && <Info className="w-3.5 h-3.5" />}
                  {simulationConsequence.verdict === 'safe' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Verdict: {simulationConsequence.verdict}</span>
                </div>
              )}
            </div>

            {/* Before vs After Delta Matrix */}
            {activeSimulation && simulationConsequence ? (
              <div className="space-y-4">
                
                {/* Metric 1: Discretionary Balance */}
                <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-400">Available Discretionary Balance</span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-base font-mono text-slate-400 line-through">
                        {formatRupee(summary.discretionaryBalance)}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className={`text-xl font-bold font-mono ${
                        simulationConsequence.simulatedSummary.isShortfall ? 'text-brand-coral' : 'text-white'
                      }`}>
                        {formatRupee(simulationConsequence.simulatedSummary.discretionaryBalance)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">Net Impact (Δ)</span>
                    <div className={`text-base font-bold font-mono ${
                      simulationConsequence.deltas.discretionaryDelta >= 0 ? 'text-brand-lime' : 'text-rose-400'
                    }`}>
                      {simulationConsequence.deltas.discretionaryDelta >= 0 ? '+' : ''}
                      {formatRupee(simulationConsequence.deltas.discretionaryDelta)}
                    </div>
                  </div>
                </div>

                {/* Metric 2: Daily Allowance */}
                <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-400">Daily Spending Allowance</span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-base font-mono text-slate-400 line-through">
                        {formatRupee(summary.dailyAllowance)}/d
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xl font-bold font-mono text-white">
                        {formatRupee(simulationConsequence.simulatedSummary.dailyAllowance)}/d
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">Daily Impact (Δ)</span>
                    <div className={`text-base font-bold font-mono ${
                      simulationConsequence.deltas.dailyAllowanceDelta >= 0 ? 'text-brand-lime' : 'text-rose-400'
                    }`}>
                      {simulationConsequence.deltas.dailyAllowanceDelta >= 0 ? '+' : ''}
                      {formatRupee(simulationConsequence.deltas.dailyAllowanceDelta)}/day
                    </div>
                  </div>
                </div>

                {/* Metric 3: Health Score & Risk Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-navy-950 border border-navy-800">
                    <span className="text-xs text-slate-400">Financial Health Score</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-lg font-bold font-mono text-white">
                        {simulationConsequence.simulatedSummary.healthScore.totalScore}/100
                      </span>
                      <span className={`text-xs font-mono font-bold ${
                        simulationConsequence.deltas.healthScoreDelta >= 0 ? 'text-brand-lime' : 'text-rose-400'
                      }`}>
                        {simulationConsequence.deltas.healthScoreDelta >= 0 ? '+' : ''}
                        {simulationConsequence.deltas.healthScoreDelta} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tier: {simulationConsequence.simulatedSummary.healthScore.tier}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-navy-950 border border-navy-800">
                    <span className="text-xs text-slate-400">Projected Risk Level</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-lg font-bold capitalize text-white">
                        {simulationConsequence.simulatedSummary.riskLevel}
                      </span>
                      {simulationConsequence.deltas.riskChanged && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold uppercase">
                          Changed
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      {simulationConsequence.simulatedSummary.riskReason}
                    </p>
                  </div>
                </div>

                {/* Threatened Commitments Warning */}
                {simulationConsequence.threatenedCommitments.length > 0 && (
                  <div className="p-4 rounded-xl bg-rose-950/40 border border-brand-coral/40 text-xs text-rose-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-brand-coral">
                      <ShieldAlert className="w-4 h-4" />
                      Commitment Threat Alert!
                    </div>
                    <p>
                      Making this choice will jeopardize funds reserved for:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 font-medium">
                      {simulationConsequence.threatenedCommitments.map(c => (
                        <li key={c.id}>
                          {c.title} ({formatRupee(c.amount)} due Day {c.dueDay})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Plain-Language Consequence Explanation */}
                <div className="p-4 rounded-xl bg-navy-850/70 border border-navy-750 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-1">PaisaPilot Analysis:</strong>
                  {simulationConsequence.verdictExplanation}
                </div>

                {/* Commit or Cancel Action Bar */}
                <div className="pt-4 border-t border-navy-750 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleApplyCommit}
                    disabled={isApplyingSimulation}
                    className="w-full sm:flex-1 py-3 px-4 bg-brand-lime hover:bg-brand-limeHover text-navy-950 font-bold rounded-xl text-xs transition-all shadow-glow-lime flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply Decision & Commit to Ledger</span>
                  </button>

                  <button
                    onClick={cancelSimulation}
                    className="w-full sm:w-auto py-3 px-5 bg-navy-800 hover:bg-navy-750 text-slate-300 rounded-xl text-xs font-semibold border border-navy-700 transition-colors"
                  >
                    Cancel Simulation
                  </button>
                </div>

              </div>
            ) : (
              /* Idle / Unsimulated state */
              <div className="py-12 px-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-sim/10 border border-brand-sim/30 flex items-center justify-center mx-auto text-brand-simLight">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">No Active Simulation</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Choose a decision type on the left, enter an amount, and click "Simulate Decision" to preview how your balance, daily runway, and goals respond.
                </p>
                <button
                  onClick={handleSimulateClick}
                  className="mt-2 px-4 py-2 bg-brand-sim hover:bg-purple-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-glow-sim transition-all"
                >
                  <span>Simulate ₹{formAmount} {formTitle}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Applied Decisions History Timeline */}
          {state.appliedHistory.length > 0 && (
            <div className="bg-navy-900 border border-navy-750 rounded-2xl p-6 shadow-card-dark">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-lime" />
                  Applied Decision Log ({state.appliedHistory.length})
                </h3>
                <span className="text-[10px] text-slate-400">Committed to Financial Ledger</span>
              </div>

              <div className="space-y-2">
                {state.appliedHistory.slice(0, 3).map(hist => (
                  <div key={hist.id} className="p-3 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-200">{hist.decision.title}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Day {hist.decision.day} • {hist.decision.type.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-brand-lime">
                      {formatRupee(hist.decision.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
