// src/components/common/Navbar.tsx
import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  Sparkles, 
  RotateCcw, 
  Download, 
  Calendar, 
  ChevronRight, 
  Sliders, 
  Receipt, 
  ShieldAlert, 
  PiggyBank, 
  Repeat, 
  TrendingUp, 
  Home
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    state, 
    summary, 
    activeView, 
    setActiveView, 
    advanceDay, 
    resetToDemo, 
    resetToPristine, 
    exportData,
    startSimulation
  } = useFinance();

  const [isResetOpen, setIsResetOpen] = useState(false);

  interface NavItem {
    id: 'landing' | 'overview' | 'ledger' | 'commitments' | 'savings' | 'subscriptions' | 'lens' | 'forecast';
    label: string;
    icon: any;
    badge?: string;
    count?: number;
  }

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Command Center', icon: Home },
    { id: 'lens', label: 'Decision Lens™', icon: Sliders, badge: 'Signature' },
    { id: 'ledger', label: 'Transactions', icon: Receipt },
    { id: 'commitments', label: 'Commitments', icon: ShieldAlert, count: state.commitments.filter(c => c.status === 'pending').length },
    { id: 'savings', label: 'Savings Goals', icon: PiggyBank, count: state.savingsGoals.length },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat, count: state.subscriptions.filter(s => s.isActive).length },
    { id: 'forecast', label: '30-Day Forecast', icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-40 bg-navy-950/90 backdrop-blur-md border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Product Identity */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveView('landing')} 
              className="flex items-center gap-2.5 group text-left"
              title="Return to Landing Page"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-lime to-emerald-400 flex items-center justify-center shadow-glow-lime group-hover:scale-105 transition-transform">
                <span className="text-navy-950 font-black text-xl leading-none">₹</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-lg tracking-tight">PaisaPilot</span>
                  <span className="text-[10px] bg-brand-lime/15 text-brand-lime font-mono px-1.5 py-0.2 rounded border border-brand-lime/25">
                    30-Day Lab
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Make every rupee count
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? item.id === 'lens'
                        ? 'bg-brand-sim text-white shadow-glow-sim'
                        : 'bg-navy-800 text-white border border-navy-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-lime' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] bg-brand-simLight/30 text-purple-200 px-1.5 py-0.2 rounded font-semibold uppercase">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[10px] bg-navy-750 text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Time Progression & Demo Actions */}
          <div className="flex items-center gap-2.5">
            {/* Day Progression Indicator */}
            <div className="flex items-center gap-1.5 bg-navy-900 border border-navy-750 px-2.5 py-1.5 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-brand-lime" />
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold font-mono text-white leading-tight">
                  Day {state.currentDay} <span className="text-slate-400 text-[10px]">/ 30</span>
                </span>
                <span className="text-[9px] text-slate-400 leading-tight">
                  {summary.remainingDays} days left
                </span>
              </div>
              <button
                onClick={() => advanceDay(1)}
                disabled={state.currentDay >= 30}
                className="ml-1 p-1 bg-navy-800 hover:bg-navy-750 disabled:opacity-40 text-brand-lime rounded border border-navy-700 hover:border-brand-lime/40 transition-colors"
                title="Advance simulation by 1 day"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Simulate Trigger */}
            <button
              onClick={() => {
                startSimulation({
                  type: 'discretionary_purchase',
                  title: 'Weekend Outing / Expense',
                  amount: 800,
                  day: state.currentDay,
                  category: 'Entertainment & OTT',
                });
              }}
              className="hidden sm:flex items-center gap-1.5 bg-brand-sim hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-glow-sim transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate</span>
            </button>

            {/* Reset / Export dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsResetOpen(!isResetOpen)}
                className="p-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-slate-400 hover:text-slate-200 border border-navy-750 transition-colors"
                title="Reset or export data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {isResetOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-navy-900 border border-navy-750 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-1">
                  <button
                    onClick={() => {
                      resetToDemo();
                      setIsResetOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-navy-800 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-brand-lime" />
                    <span>Reset to Hackathon Demo</span>
                  </button>
                  <button
                    onClick={() => {
                      resetToPristine();
                      setIsResetOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-navy-800 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reset to Clean Slate (₹10k)</span>
                  </button>
                  <div className="border-t border-navy-800 my-1" />
                  <button
                    onClick={() => {
                      exportData();
                      setIsResetOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-navy-800 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Export State (.json)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-navy-850 no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap font-medium ${
                  isActive
                    ? 'bg-navy-800 text-brand-lime border border-navy-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
