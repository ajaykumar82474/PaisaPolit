// src/context/FinanceContext.tsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  AppState, 
  FinancialSummary, 
  Transaction, 
  Commitment, 
  SavingsGoal, 
  Subscription, 
  DecisionSimulation, 
  DecisionConsequence,
  ScenarioAlternative,
  DayForecastPoint,
  InsightItem 
} from '../types/finance';
import { calculateFinancialSummary, simulateDecision, roundRupees } from '../domain/financialEngine';
import { generate30DayForecast } from '../domain/forecastEngine';
import { generateInsights } from '../domain/insightEngine';
import { StorageService } from '../storage/storageService';

interface FinanceContextType {
  state: AppState;
  summary: FinancialSummary;
  forecast: DayForecastPoint[];
  insights: InsightItem[];
  
  // Navigation / View State
  activeView: 'landing' | 'overview' | 'ledger' | 'commitments' | 'savings' | 'subscriptions' | 'lens' | 'forecast';
  setActiveView: (view: 'landing' | 'overview' | 'ledger' | 'commitments' | 'savings' | 'subscriptions' | 'lens' | 'forecast') => void;

  // Simulation State
  activeSimulation: DecisionSimulation | null;
  simulationConsequence: DecisionConsequence | null;
  activeAlternatives: ScenarioAlternative[];
  alternativesResults: { alternative: ScenarioAlternative; consequence: DecisionConsequence }[];
  isApplyingSimulation: boolean;
  isComparing: boolean;
  setIsComparing: (val: boolean) => void;
  
  // Actions - Ledger
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Actions - Commitments
  addCommitment: (c: Omit<Commitment, 'id'>) => void;
  editCommitment: (id: string, updates: Partial<Commitment>) => void;
  deleteCommitment: (id: string) => void;
  payCommitment: (id: string) => void;
  cancelCommitment: (id: string) => void;

  // Actions - Savings Goals
  addSavingsGoal: (g: Omit<SavingsGoal, 'id' | 'createdAt' | 'contributions'>) => void;
  contributeToGoal: (goalId: string, amount: number, notes?: string) => boolean;
  editSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;

  // Actions - Subscriptions
  addSubscription: (s: Omit<Subscription, 'id'>) => void;
  editSubscription: (id: string, updates: Partial<Subscription>) => void;
  toggleSubscription: (id: string) => void;
  deleteSubscription: (id: string) => void;

  // Actions - Time & Progression
  advanceDay: (days?: number) => void;
  jumpToDay: (day: number) => void;

  // Actions - Simulation
  startSimulation: (decision: DecisionSimulation) => void;
  updateSimulation: (decision: Partial<DecisionSimulation>) => void;
  cancelSimulation: () => void;
  applySimulation: () => boolean;
  undoLastApplied: () => boolean;
  setScenarioAlternatives: (alts: ScenarioAlternative[]) => void;

  // Demo & Reset
  resetToDemo: () => void;
  resetToPristine: () => void;
  exportData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => StorageService.loadState());
  const [activeView, setActiveView] = useState<'landing' | 'overview' | 'ledger' | 'commitments' | 'savings' | 'subscriptions' | 'lens' | 'forecast'>('overview');
  
  // Simulation states
  const [activeSimulation, setActiveSimulation] = useState<DecisionSimulation | null>(null);
  const [activeAlternatives, setActiveAlternatives] = useState<ScenarioAlternative[]>([]);
  const [isApplyingSimulation, setIsApplyingSimulation] = useState<boolean>(false);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // Synchronize state with storage
  useEffect(() => {
    StorageService.saveState(state);
  }, [state]);

  // Derived Financial Summary - Single Source of Truth
  const summary = useMemo(() => {
    return calculateFinancialSummary(state);
  }, [state]);

  // Derived 30-Day Forecast
  const forecast = useMemo(() => {
    return generate30DayForecast(state);
  }, [state]);

  // Derived Rule-Based Insights
  const insights = useMemo(() => {
    return generateInsights(state);
  }, [state]);

  // Derived Simulation Consequence
  const simulationConsequence = useMemo(() => {
    if (!activeSimulation) return null;
    return simulateDecision(state, activeSimulation);
  }, [state, activeSimulation]);

  // Derived Alternative Scenarios
  const alternativesResults = useMemo(() => {
    if (activeAlternatives.length === 0) return [];
    return activeAlternatives.map(alt => {
      const decision: DecisionSimulation = {
        type: alt.type,
        title: alt.name,
        amount: alt.amount,
        day: alt.day,
        category: alt.category,
        notes: alt.notes,
      };
      return {
        alternative: alt,
        consequence: simulateDecision(state, decision),
      };
    });
  }, [state, activeAlternatives]);

  // --- ACTIONS ---

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    setState(prev => {
      const newTx: Transaction = {
        ...tx,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        transactions: [newTx, ...prev.transactions],
      };
    });
  }, []);

  const editTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id),
    }));
  }, []);

  const addCommitment = useCallback((c: Omit<Commitment, 'id'>) => {
    setState(prev => {
      const newCommitment: Commitment = {
        ...c,
        id: `commit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      };
      return {
        ...prev,
        commitments: [...prev.commitments, newCommitment],
      };
    });
  }, []);

  const editCommitment = useCallback((id: string, updates: Partial<Commitment>) => {
    setState(prev => ({
      ...prev,
      commitments: prev.commitments.map(c => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const deleteCommitment = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      commitments: prev.commitments.filter(c => c.id !== id),
    }));
  }, []);

  /**
   * Paying a commitment:
   * 1. Updates commitment status to 'paid'
   * 2. Releases the unpaid commitment reservation
   * 3. Records an actual expense transaction in the ledger
   * Discretionary balance remains consistent without double deduction!
   */
  const payCommitment = useCallback((id: string) => {
    setState(prev => {
      const target = prev.commitments.find(c => c.id === id);
      if (!target || target.status === 'paid') return prev;

      const txId = `tx-paid-${target.id}-${Date.now()}`;
      const paidTx: Transaction = {
        id: txId,
        type: 'expense',
        amount: target.amount,
        category: target.category,
        description: `Paid: ${target.title}`,
        day: prev.currentDay,
        date: new Date().toISOString().split('T')[0],
        relatedCommitmentId: target.id,
        createdAt: new Date().toISOString(),
      };

      const updatedCommitments = prev.commitments.map(c => 
        c.id === id ? { ...c, status: 'paid' as const, paidTransactionId: txId } : c
      );

      return {
        ...prev,
        transactions: [paidTx, ...prev.transactions],
        commitments: updatedCommitments,
      };
    });
  }, []);

  const cancelCommitment = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      commitments: prev.commitments.map(c => 
        c.id === id ? { ...c, status: 'cancelled' as const } : c
      ),
    }));
  }, []);

  const addSavingsGoal = useCallback((g: Omit<SavingsGoal, 'id' | 'createdAt' | 'contributions'>) => {
    setState(prev => {
      const newGoal: SavingsGoal = {
        ...g,
        id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        currentAmount: g.currentAmount || 0,
        contributions: (g.currentAmount && g.currentAmount > 0) ? [{
          id: `contrib-${Date.now()}`,
          amount: g.currentAmount,
          day: prev.currentDay,
          date: new Date().toISOString().split('T')[0],
          notes: 'Initial allocation',
        }] : [],
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        savingsGoals: [...prev.savingsGoals, newGoal],
      };
    });
  }, []);

  const contributeToGoal = useCallback((goalId: string, amount: number, notes?: string): boolean => {
    if (amount <= 0) return false;
    setState(prev => {
      const goal = prev.savingsGoals.find(g => g.id === goalId);
      if (!goal) return prev;

      const newContribution = {
        id: `contrib-${Date.now()}`,
        amount: roundRupees(amount),
        day: prev.currentDay,
        date: new Date().toISOString().split('T')[0],
        notes: notes || 'Goal contribution',
      };

      const updatedGoals = prev.savingsGoals.map(g => {
        if (g.id !== goalId) return g;
        return {
          ...g,
          currentAmount: roundRupees(g.currentAmount + amount),
          contributions: [newContribution, ...g.contributions],
        };
      });

      return {
        ...prev,
        savingsGoals: updatedGoals,
      };
    });
    return true;
  }, []);

  const editSavingsGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    setState(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map(g => (g.id === id ? { ...g, ...updates } : g)),
    }));
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter(g => g.id !== id),
    }));
  }, []);

  const addSubscription = useCallback((s: Omit<Subscription, 'id'>) => {
    setState(prev => {
      const newSub: Subscription = {
        ...s,
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      };
      return {
        ...prev,
        subscriptions: [...prev.subscriptions, newSub],
      };
    });
  }, []);

  const editSubscription = useCallback((id: string, updates: Partial<Subscription>) => {
    setState(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const toggleSubscription = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s => (s.id === id ? { ...s, isActive: !s.isActive } : s)),
    }));
  }, []);

  const deleteSubscription = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.filter(s => s.id !== id),
    }));
  }, []);

  // Time advancement
  const advanceDay = useCallback((days: number = 1) => {
    setState(prev => {
      const nextDay = Math.min(prev.totalDays, prev.currentDay + days);
      // Auto-trigger any subscription billing on this day if active
      const subscriptionsBillingToday = prev.subscriptions.filter(
        s => s.isActive && s.billingDay > prev.currentDay && s.billingDay <= nextDay
      );
      
      const newTxs: Transaction[] = subscriptionsBillingToday.map(s => ({
        id: `tx-sub-auto-${s.id}-${nextDay}`,
        type: 'expense' as const,
        amount: s.amount,
        category: s.category,
        description: `Auto-Renewed: ${s.name}`,
        day: s.billingDay,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      }));

      return {
        ...prev,
        currentDay: nextDay,
        transactions: [...newTxs, ...prev.transactions],
      };
    });
  }, []);

  const jumpToDay = useCallback((day: number) => {
    setState(prev => ({
      ...prev,
      currentDay: Math.max(1, Math.min(prev.totalDays, day)),
    }));
  }, []);

  // Simulation controls
  const startSimulation = useCallback((decision: DecisionSimulation) => {
    setActiveSimulation(decision);
    setActiveView('lens');
  }, []);

  const updateSimulation = useCallback((updates: Partial<DecisionSimulation>) => {
    setActiveSimulation(prev => (prev ? { ...prev, ...updates } : null));
  }, []);

  const cancelSimulation = useCallback(() => {
    setActiveSimulation(null);
  }, []);

  const setScenarioAlternatives = useCallback((alts: ScenarioAlternative[]) => {
    setActiveAlternatives(alts);
  }, []);

  /**
   * Applies the simulated decision to actual financial records.
   * Guarantees idempotent application, prevents double clicks,
   * records history for undo support.
   */
  const applySimulation = useCallback((): boolean => {
    if (!activeSimulation || isApplyingSimulation) return false;
    setIsApplyingSimulation(true);

    try {
      const decision = activeSimulation;
      const historyId = `hist-${Date.now()}`;
      let createdTxId: string | undefined;
      let createdSubId: string | undefined;
      let createdGoalId: string | undefined;

      setState(prev => {
        let updatedTransactions = [...prev.transactions];
        let updatedSubscriptions = [...prev.subscriptions];
        let updatedGoals = [...prev.savingsGoals];

        if (decision.type === 'discretionary_purchase' || decision.type === 'unexpected_expense') {
          createdTxId = `tx-applied-${Date.now()}`;
          const newTx: Transaction = {
            id: createdTxId,
            type: 'expense',
            amount: roundRupees(decision.amount),
            category: decision.category,
            description: decision.title,
            day: decision.day || prev.currentDay,
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
          };
          updatedTransactions = [newTx, ...updatedTransactions];
        } else if (decision.type === 'extra_income') {
          createdTxId = `tx-applied-${Date.now()}`;
          const newTx: Transaction = {
            id: createdTxId,
            type: 'income',
            amount: roundRupees(decision.amount),
            category: decision.category,
            description: decision.title,
            day: decision.day || prev.currentDay,
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
          };
          updatedTransactions = [newTx, ...updatedTransactions];
        } else if (decision.type === 'new_subscription') {
          createdSubId = `sub-applied-${Date.now()}`;
          const newSub: Subscription = {
            id: createdSubId,
            name: decision.title,
            amount: roundRupees(decision.amount),
            billingFrequency: 'monthly',
            billingDay: decision.day || prev.currentDay,
            category: decision.category,
            isActive: true,
          };
          updatedSubscriptions = [...updatedSubscriptions, newSub];

          // If billing day is today or earlier in period, charge initial cycle
          if ((decision.day || prev.currentDay) <= prev.totalDays) {
            createdTxId = `tx-sub-${Date.now()}`;
            const subTx: Transaction = {
              id: createdTxId,
              type: 'expense',
              amount: roundRupees(decision.amount),
              category: decision.category,
              description: `Initial Charge: ${decision.title}`,
              day: decision.day || prev.currentDay,
              date: new Date().toISOString().split('T')[0],
              createdAt: new Date().toISOString(),
            };
            updatedTransactions = [subTx, ...updatedTransactions];
          }
        } else if (decision.type === 'savings_contribution') {
          if (updatedGoals.length > 0) {
            createdGoalId = updatedGoals[0].id;
            const contribId = `contrib-${Date.now()}`;
            updatedGoals = updatedGoals.map((g, idx) => {
              if (idx !== 0) return g;
              return {
                ...g,
                currentAmount: roundRupees(g.currentAmount + decision.amount),
                contributions: [{
                  id: contribId,
                  amount: roundRupees(decision.amount),
                  day: prev.currentDay,
                  date: new Date().toISOString().split('T')[0],
                  notes: decision.title,
                }, ...g.contributions],
              };
            });
          } else {
            createdGoalId = `goal-applied-${Date.now()}`;
            const newGoal: SavingsGoal = {
              id: createdGoalId,
              name: decision.title || 'Savings Goal',
              targetAmount: roundRupees(decision.amount * 2),
              currentAmount: roundRupees(decision.amount),
              targetDay: 30,
              contributions: [{
                id: `contrib-${Date.now()}`,
                amount: roundRupees(decision.amount),
                day: prev.currentDay,
                date: new Date().toISOString().split('T')[0],
              }],
              createdAt: new Date().toISOString(),
            };
            updatedGoals = [...updatedGoals, newGoal];
          }
        }

        const newHistoryItem = {
          id: historyId,
          timestamp: new Date().toISOString(),
          decision,
          createdTransactionId: createdTxId,
          createdSubscriptionId: createdSubId,
          createdGoalId: createdGoalId,
        };

        return {
          ...prev,
          transactions: updatedTransactions,
          subscriptions: updatedSubscriptions,
          savingsGoals: updatedGoals,
          appliedHistory: [newHistoryItem, ...prev.appliedHistory],
        };
      });

      // Clear active simulation upon successful commit
      setActiveSimulation(null);
      return true;
    } finally {
      setIsApplyingSimulation(false);
    }
  }, [activeSimulation, isApplyingSimulation]);

  // Undo the most recent applied decision
  const undoLastApplied = useCallback((): boolean => {
    if (state.appliedHistory.length === 0) return false;
    const lastItem = state.appliedHistory[0];

    setState(prev => {
      let updatedTxs = prev.transactions;
      let updatedSubs = prev.subscriptions;
      let updatedGoals = prev.savingsGoals;

      if (lastItem.createdTransactionId) {
        updatedTxs = updatedTxs.filter(t => t.id !== lastItem.createdTransactionId);
      }
      if (lastItem.createdSubscriptionId) {
        updatedSubs = updatedSubs.filter(s => s.id !== lastItem.createdSubscriptionId);
      }
      if (lastItem.createdGoalId && lastItem.decision.type === 'savings_contribution') {
        updatedGoals = updatedGoals.map(g => {
          if (g.id !== lastItem.createdGoalId) return g;
          return {
            ...g,
            currentAmount: roundRupees(Math.max(0, g.currentAmount - lastItem.decision.amount)),
            contributions: g.contributions.slice(1),
          };
        });
      }

      return {
        ...prev,
        transactions: updatedTxs,
        subscriptions: updatedSubs,
        savingsGoals: updatedGoals,
        appliedHistory: prev.appliedHistory.slice(1),
      };
    });

    return true;
  }, [state.appliedHistory]);

  const resetToDemo = useCallback(() => {
    const demo = StorageService.resetToDemo();
    setState(demo);
    setActiveSimulation(null);
  }, []);

  const resetToPristine = useCallback(() => {
    const pristine = StorageService.resetToPristine();
    setState(pristine);
    setActiveSimulation(null);
  }, []);

  const exportData = useCallback(() => {
    StorageService.exportJSON(state);
  }, [state]);

  const value = {
    state,
    summary,
    forecast,
    insights,
    activeView,
    setActiveView,
    activeSimulation,
    simulationConsequence,
    activeAlternatives,
    alternativesResults,
    isApplyingSimulation,
    addTransaction,
    editTransaction,
    deleteTransaction,
    addCommitment,
    editCommitment,
    deleteCommitment,
    payCommitment,
    cancelCommitment,
    addSavingsGoal,
    contributeToGoal,
    editSavingsGoal,
    deleteSavingsGoal,
    addSubscription,
    editSubscription,
    toggleSubscription,
    deleteSubscription,
    advanceDay,
    jumpToDay,
    startSimulation,
    updateSimulation,
    cancelSimulation,
    applySimulation,
    undoLastApplied,
    setScenarioAlternatives,
    resetToDemo,
    resetToPristine,
    exportData,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
