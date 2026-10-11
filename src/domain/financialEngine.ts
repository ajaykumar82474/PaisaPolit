// src/domain/financialEngine.ts
import { 
  AppState, 
  FinancialSummary, 
  DecisionSimulation, 
  DecisionConsequence,
  Commitment,
  SavingsGoal
} from '../types/finance';
import { calculateHealthScore, calculateRiskLevel } from './healthScore';

/**
 * Rounds a number to 2 decimal places to prevent floating-point anomalies
 */
export function roundRupees(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Single Source of Truth for calculating the complete Financial Summary
 * All components, charts, and simulation engines derive their state here.
 */
export function calculateFinancialSummary(state: AppState): FinancialSummary {
  const initialBudget = state.initialBudget || 10000;
  const totalDays = state.totalDays || 30;
  const currentDay = Math.max(1, state.currentDay || 1);
  
  // Remaining days includes current day (e.g. Day 1 -> 30 days left; Day 30 -> 1 day left)
  // If past day 30, 0 days remaining
  const remainingDays = currentDay > totalDays ? 0 : (totalDays - currentDay + 1);

  // 1. Calculate Income (I) - only within modeled period and not simulated
  const totalIncome = roundRupees(
    state.transactions
      .filter(t => t.type === 'income' && !t.isSimulated)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  // 2. Calculate Expenses (E) - only within modeled period and not simulated
  const totalExpenses = roundRupees(
    state.transactions
      .filter(t => t.type === 'expense' && !t.isSimulated)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  // 3. Calculate Protected Savings (S)
  // Sum of all money currently saved inside savings goals
  const protectedSavings = roundRupees(
    state.savingsGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0)
  );

  // 4. Calculate Unpaid Commitments (C)
  // Only commitments with status 'pending' or 'overdue' reserve available funds.
  // Paid commitments are already recorded as expenses (E) and must NOT be deducted twice.
  // Cancelled commitments release their reservation.
  const unpaidCommitments = roundRupees(
    state.commitments
      .filter(c => c.status === 'pending' || c.status === 'overdue')
      .reduce((sum, c) => sum + c.amount, 0)
  );

  // 5. Total Ledger Balance (B)
  // B = B0 + I - E
  const ledgerBalance = roundRupees(initialBudget + totalIncome - totalExpenses);

  // 6. Available Discretionary Balance (D)
  // D = B - S - C
  const discretionaryBalance = roundRupees(ledgerBalance - protectedSavings - unpaidCommitments);

  // Shortfall detection
  const isShortfall = discretionaryBalance < 0;
  const shortfallAmount = isShortfall ? Math.abs(discretionaryBalance) : 0;

  // 7. Daily Spending Allowance
  // If remainingDays == 0, no division by zero!
  let dailyAllowance = 0;
  if (remainingDays > 0) {
    dailyAllowance = roundRupees(discretionaryBalance / remainingDays);
  }

  // 8. Actual Daily Burn Rate
  const actualDailyBurn = currentDay > 0 ? roundRupees(totalExpenses / currentDay) : 0;

  // 9. Projected End-of-Period Balance
  // Future active subscriptions due in [currentDay + 1 ... totalDays]
  const futureSubscriptions = state.subscriptions
    .filter(s => s.isActive && s.billingDay > currentDay && s.billingDay <= totalDays)
    .reduce((sum, s) => sum + s.amount, 0);

  // If user continues spending their daily allowance, discretionary funds will be spent,
  // leaving protected savings (S) minus any future unreserved subscriptions.
  // End Balance = Protected Savings + any surplus unspent if daily allowance is not fully consumed,
  // or B - unpaidCommitments - futureSubscriptions - (dailyAllowance * remainingDays)
  // Since dailyAllowance * remainingDays = discretionaryBalance (when D >= 0),
  // End Balance = (B - unpaidCommitments - discretionaryBalance) - futureSubscriptions = S - futureSubscriptions.
  // When discretionaryBalance < 0, End Balance reflects the negative deficit.
  let projectedEndBalance = roundRupees(
    discretionaryBalance >= 0
      ? protectedSavings - futureSubscriptions
      : discretionaryBalance + protectedSavings - futureSubscriptions
  );

  // 10. Financial Health & Risk Assessment
  const totalSavingsTarget = state.savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);

  const healthScore = calculateHealthScore({
    discretionaryBalance,
    ledgerBalance,
    unpaidCommitments,
    protectedSavings,
    totalSavingsTarget,
    currentDay,
    remainingDays,
    initialBudget,
    dailyAllowance,
    actualDailyBurn,
  });

  const { level: riskLevel, reason: riskReason } = calculateRiskLevel(
    discretionaryBalance,
    ledgerBalance,
    unpaidCommitments,
    remainingDays,
    dailyAllowance
  );

  return {
    initialBudget,
    totalIncome,
    totalExpenses,
    protectedSavings,
    unpaidCommitments,
    ledgerBalance,
    discretionaryBalance,
    currentDay,
    totalDays,
    remainingDays,
    dailyAllowance,
    actualDailyBurn,
    projectedEndBalance,
    healthScore,
    riskLevel,
    riskReason,
    isShortfall,
    shortfallAmount,
  };
}

/**
 * Runs a simulated decision on an isolated clone of the state without modifying the original.
 * Generates exact deltas, threatened commitments, and an actionable verdict.
 */
export function simulateDecision(
  baselineState: AppState,
  decision: DecisionSimulation
): DecisionConsequence {
  // Deep clone state to ensure absolute isolation
  const simState: AppState = JSON.parse(JSON.stringify(baselineState));
  const currentSummary = calculateFinancialSummary(baselineState);

  // Apply simulated event according to decision type
  switch (decision.type) {
    case 'discretionary_purchase':
    case 'unexpected_expense': {
      simState.transactions.push({
        id: `sim-tx-${Date.now()}`,
        type: 'expense',
        amount: roundRupees(decision.amount),
        category: decision.category,
        description: `[SIMULATED] ${decision.title}`,
        day: decision.day || simState.currentDay,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        isSimulated: false, // In clone, treat as real to see recalculation
      });
      break;
    }

    case 'extra_income': {
      simState.transactions.push({
        id: `sim-tx-${Date.now()}`,
        type: 'income',
        amount: roundRupees(decision.amount),
        category: decision.category,
        description: `[SIMULATED] ${decision.title}`,
        day: decision.day || simState.currentDay,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        isSimulated: false,
      });
      break;
    }

    case 'savings_contribution': {
      // Allocate into first goal or create a simulated goal
      if (simState.savingsGoals.length > 0) {
        simState.savingsGoals[0].currentAmount += roundRupees(decision.amount);
      } else {
        simState.savingsGoals.push({
          id: `sim-goal-${Date.now()}`,
          name: decision.title || 'Simulated Goal',
          targetAmount: roundRupees(decision.amount * 2),
          currentAmount: roundRupees(decision.amount),
          targetDay: 30,
          contributions: [{
            id: `sim-contrib-1`,
            amount: roundRupees(decision.amount),
            day: simState.currentDay,
            date: new Date().toISOString().split('T')[0]
          }],
          createdAt: new Date().toISOString(),
        });
      }
      break;
    }

    case 'new_subscription': {
      simState.subscriptions.push({
        id: `sim-sub-${Date.now()}`,
        name: decision.title,
        amount: roundRupees(decision.amount),
        billingFrequency: 'monthly',
        billingDay: decision.day || simState.currentDay,
        category: decision.category,
        isActive: true,
      });
      // Also log immediate first charge if billing day <= totalDays
      if (decision.day <= simState.totalDays) {
        simState.transactions.push({
          id: `sim-sub-tx-${Date.now()}`,
          type: 'expense',
          amount: roundRupees(decision.amount),
          category: decision.category,
          description: `[SIMULATED SUB] ${decision.title}`,
          day: decision.day,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          isSimulated: false,
        });
      }
      break;
    }
  }

  const simulatedSummary = calculateFinancialSummary(simState);

  // Compute precise deltas
  const discretionaryDelta = roundRupees(simulatedSummary.discretionaryBalance - currentSummary.discretionaryBalance);
  const dailyAllowanceDelta = roundRupees(simulatedSummary.dailyAllowance - currentSummary.dailyAllowance);
  const projectedEndBalanceDelta = roundRupees(simulatedSummary.projectedEndBalance - currentSummary.projectedEndBalance);
  const healthScoreDelta = simulatedSummary.healthScore.totalScore - currentSummary.healthScore.totalScore;

  // Identify threatened commitments:
  // If simulated discretionary balance is less than 0 or ledger balance drops below remaining unpaid commitments
  const threatenedCommitments: Commitment[] = [];
  if (simulatedSummary.ledgerBalance < simulatedSummary.unpaidCommitments) {
    // Commitments that might not be payable
    let accum = simulatedSummary.ledgerBalance;
    simState.commitments
      .filter(c => c.status === 'pending' || c.status === 'overdue')
      .forEach(c => {
        if (accum < c.amount) {
          threatenedCommitments.push(c);
        } else {
          accum -= c.amount;
        }
      });
  }

  // Identify threatened goals:
  // Goals whose remaining target cannot be met given the new smaller discretionary balance
  const threatenedGoals: SavingsGoal[] = [];
  simState.savingsGoals.forEach(g => {
    const remainingNeed = g.targetAmount - g.currentAmount;
    if (remainingNeed > 0 && simulatedSummary.discretionaryBalance < remainingNeed) {
      threatenedGoals.push(g);
    }
  });

  // Determine Verdict
  let verdict: 'safe' | 'caution' | 'dangerous' = 'safe';
  let verdictExplanation = '';

  if (simulatedSummary.isShortfall || threatenedCommitments.length > 0) {
    verdict = 'dangerous';
    verdictExplanation = `Critical Risk: This decision creates a deficit of ₹${Math.abs(simulatedSummary.discretionaryBalance).toLocaleString('en-IN')}${threatenedCommitments.length > 0 ? ` and puts ${threatenedCommitments.length} commitment(s) at risk` : ''}.`;
  } else if (simulatedSummary.dailyAllowance < 100 || simulatedSummary.riskLevel === 'high' || threatenedGoals.length > 0) {
    verdict = 'caution';
    verdictExplanation = `Caution: Daily spending drops to ₹${Math.round(simulatedSummary.dailyAllowance)}/day (${dailyAllowanceDelta < 0 ? `-₹${Math.abs(dailyAllowanceDelta)}/day` : ''}). Your financial buffer will be constrained.`;
  } else {
    verdict = 'safe';
    verdictExplanation = `Safe to Proceed: Healthy remaining allowance of ₹${Math.round(simulatedSummary.dailyAllowance)}/day with all commitments fully protected.`;
  }

  return {
    simulatedSummary,
    deltas: {
      discretionaryDelta,
      dailyAllowanceDelta,
      projectedEndBalanceDelta,
      healthScoreDelta,
      riskChanged: simulatedSummary.riskLevel !== currentSummary.riskLevel,
      previousRisk: currentSummary.riskLevel,
      newRisk: simulatedSummary.riskLevel,
    },
    threatenedCommitments,
    threatenedGoals,
    verdict,
    verdictExplanation,
  };
}
