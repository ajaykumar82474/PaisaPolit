// src/App.tsx
import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/common/Navbar';
import { DemoTourBar } from './components/common/DemoTourBar';
import { LandingHero } from './components/landing/LandingHero';
import { MoneyCommandCenter } from './components/dashboard/MoneyCommandCenter';
import { DecisionLens } from './components/lens/DecisionLens';
import { TransactionLedger } from './components/ledger/TransactionLedger';
import { CommitmentManager } from './components/commitments/CommitmentManager';
import { SavingsGoalManager } from './components/savings/SavingsGoalManager';
import { SubscriptionManager } from './components/subscriptions/SubscriptionManager';
import { ForecastView } from './components/forecast/ForecastView';

const MainContent: React.FC = () => {
  const { activeView } = useFinance();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
      {activeView === 'landing' && <LandingHero />}
      {activeView === 'overview' && <MoneyCommandCenter />}
      {activeView === 'lens' && <DecisionLens />}
      {activeView === 'ledger' && <TransactionLedger />}
      {activeView === 'commitments' && <CommitmentManager />}
      {activeView === 'savings' && <SavingsGoalManager />}
      {activeView === 'subscriptions' && <SubscriptionManager />}
      {activeView === 'forecast' && <ForecastView />}
    </main>
  );
};

export function App() {
  return (
    <FinanceProvider>
      <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-brand-lime selection:text-navy-950 font-sans">
        <DemoTourBar />
        <Navbar />
        <MainContent />
        
        {/* Editorial Footer */}
        <footer className="border-t border-navy-850 bg-navy-950/80 py-8 px-4 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm">PaisaPilot</span>
              <span>— The 30-Day Money Lab for Gen Z.</span>
              <span className="text-slate-400 font-mono">₹10,000 Sandbox</span>
            </div>

            <div className="text-slate-400 flex items-center gap-4 text-[11px]">
              <span>Decision → Simulation → Consequence → Commit or Cancel</span>
              <span>•</span>
              <span>Deterministic Financial State Engine</span>
            </div>
          </div>
        </footer>
      </div>
    </FinanceProvider>
  );
}

export default App;
