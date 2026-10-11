// src/types/finance.ts

export type TransactionType = 'expense' | 'income';

export type Category = 
  | 'Food & Chai'
  | 'Metro & Transport'
  | 'College & Books'
  | 'Mobile & Wifi'
  | 'Entertainment & OTT'
  | 'Shopping & Fashion'
  | 'Healthcare'
  | 'Emergency'
  | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // in Rupees
  category: Category;
  description: string;
  day: number; // 1-30
  date: string; // ISO or YYYY-MM-DD
  notes?: string;
  createdAt: string;
  relatedCommitmentId?: string;
  isSimulated?: boolean;
}

export type CommitmentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface Commitment {
  id: string;
  title: string;
  amount: number;
  dueDay: number; // 1-30
  dueDate: string;
  category: Category;
  status: CommitmentStatus;
  notes?: string;
  paidTransactionId?: string;
  isRecurring?: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDay: number; // 1-30
  category?: string;
  contributions: {
    id: string;
    amount: number;
    day: number;
    date: string;
    notes?: string;
  }[];
  createdAt: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingFrequency: 'monthly' | 'weekly';
  billingDay: number; // Day of month (1-30)
  category: Category;
  isActive: boolean;
  notes?: string;
}

export type DecisionType = 
  | 'discretionary_purchase'
  | 'unexpected_expense'
  | 'new_subscription'
  | 'savings_contribution'
  | 'extra_income';

export interface DecisionSimulation {
  type: DecisionType;
  title: string;
  amount: number;
  day: number;
  category: Category;
  isRecurring?: boolean;
  notes?: string;
}

export interface ScenarioAlternative {
  id: string;
  name: string;
  tagline: string;
  amount: number;
  day: number;
  type: DecisionType;
  category: Category;
  notes?: string;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface HealthScoreBreakdown {
  totalScore: number; // 0 - 100
  tier: 'Thriving' | 'Stable' | 'Cautious' | 'Critical';
  factors: {
    discretionaryCushion: { score: number; max: number; label: string; desc: string };
    commitmentCoverage: { score: number; max: number; label: string; desc: string };
    savingsFeasibility: { score: number; max: number; label: string; desc: string };
    pacingAndBurnRate: { score: number; max: number; label: string; desc: string };
    emergencyBuffer: { score: number; max: number; label: string; desc: string };
  };
  recommendations: string[];
}

export interface FinancialSummary {
  // Baseline inputs
  initialBudget: number;       // B0
  totalIncome: number;         // I
  totalExpenses: number;       // E
  protectedSavings: number;    // S
  unpaidCommitments: number;   // C
  
  // Core derived balances
  ledgerBalance: number;       // B = B0 + I - E
  discretionaryBalance: number;// D = B - S - C
  
  // Time and pacing
  currentDay: number;          // 1-30
  totalDays: number;           // 30
  remainingDays: number;       // e.g. 30 - currentDay + 1
  dailyAllowance: number;      // D / remainingDays (safe from /0)
  actualDailyBurn: number;     // E / currentDay
  
  // Projections
  projectedEndBalance: number; // Projected balance at day 30
  
  // Health & Risk
  healthScore: HealthScoreBreakdown;
  riskLevel: RiskLevel;
  riskReason: string;
  
  // Alerts
  isShortfall: boolean;
  shortfallAmount: number;
}

export interface ComparisonDelta {
  metric: string;
  current: number;
  simulated: number;
  delta: number;
  deltaPercent?: number;
  unit: string;
  isPositiveGood: boolean;
}

export interface DecisionConsequence {
  simulatedSummary: FinancialSummary;
  deltas: {
    discretionaryDelta: number;
    dailyAllowanceDelta: number;
    projectedEndBalanceDelta: number;
    healthScoreDelta: number;
    riskChanged: boolean;
    previousRisk: RiskLevel;
    newRisk: RiskLevel;
  };
  threatenedCommitments: Commitment[];
  threatenedGoals: SavingsGoal[];
  verdict: 'safe' | 'caution' | 'dangerous';
  verdictExplanation: string;
}

export interface InsightItem {
  id: string;
  type: 'opportunity' | 'warning' | 'tip' | 'achievement';
  title: string;
  description: string;
  impactAmount?: number;
  suggestedAction?: {
    label: string;
    actionType: 'open_lens' | 'view_commitments' | 'view_goals' | 'view_ledger';
    payload?: any;
  };
}

export interface DayForecastPoint {
  day: number;
  openingBalance: number;
  scheduledCommitments: number;
  scheduledSubscriptions: number;
  expectedDiscretionarySpend: number;
  closingBalance: number;
  bestCaseBalance: number;
  stressCaseBalance: number;
  events: string[];
}

export interface AppState {
  initialBudget: number;
  currentDay: number;
  totalDays: number;
  transactions: Transaction[];
  commitments: Commitment[];
  savingsGoals: SavingsGoal[];
  subscriptions: Subscription[];
  appliedHistory: {
    id: string;
    timestamp: string;
    decision: DecisionSimulation;
    createdTransactionId?: string;
    createdCommitmentId?: string;
    createdGoalId?: string;
    createdSubscriptionId?: string;
  }[];
}
