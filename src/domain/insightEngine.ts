// src/domain/insightEngine.ts
import { AppState, InsightItem } from '../types/finance';
import { calculateFinancialSummary } from './financialEngine';

export function generateInsights(state: AppState): InsightItem[] {
  const summary = calculateFinancialSummary(state);
  const insights: InsightItem[] = [];

  // 1. Category Concentration Check
  const categoryTotals = new Map<string, number>();
  let totalExpenses = 0;
  state.transactions
    .filter(t => t.type === 'expense' && !t.isSimulated)
    .forEach(t => {
      categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + t.amount);
      totalExpenses += t.amount;
    });

  if (totalExpenses > 0) {
    categoryTotals.forEach((amount, category) => {
      const share = (amount / totalExpenses) * 100;
      if (share >= 40) {
        insights.push({
          id: `cat-heavy-${category}`,
          type: 'warning',
          title: `High ${category} Spend Concentration`,
          description: `${category} accounts for ${Math.round(share)}% (₹${amount.toLocaleString('en-IN')}) of your total expenses so far. Moderating this could free up ₹300-500.`,
          impactAmount: amount,
          suggestedAction: {
            label: 'Inspect Spending Ledger',
            actionType: 'view_ledger'
          }
        });
      }
    });
  }

  // 2. Upcoming Imminent Commitments (due within next 3 days)
  const imminent = state.commitments.filter(
    c => (c.status === 'pending' || c.status === 'overdue') && 
         c.dueDay >= state.currentDay && 
         c.dueDay <= state.currentDay + 3
  );

  if (imminent.length > 0) {
    const totalImminent = imminent.reduce((s, c) => s + c.amount, 0);
    insights.push({
      id: 'imminent-commitments',
      type: 'warning',
      title: `${imminent.length} Commitment(s) Due in Next 3 Days`,
      description: `₹${totalImminent.toLocaleString('en-IN')} in reserved commitments will be due soon (${imminent.map(c => `${c.title} on Day ${c.dueDay}`).join(', ')}). Your ledger funds are reserved.`,
      impactAmount: totalImminent,
      suggestedAction: {
        label: 'View Commitments',
        actionType: 'view_commitments'
      }
    });
  }

  // 3. Daily Allowance Runway
  if (summary.dailyAllowance > 0 && summary.dailyAllowance < 120) {
    insights.push({
      id: 'tight-allowance',
      type: 'warning',
      title: 'Restricted Daily Spending Cap',
      description: `Your remaining daily allowance is ₹${Math.round(summary.dailyAllowance)}/day for ${summary.remainingDays} days. Simulate purchases in Decision Lens before swiping.`,
      suggestedAction: {
        label: 'Open Decision Lens',
        actionType: 'open_lens'
      }
    });
  } else if (summary.dailyAllowance >= 250) {
    insights.push({
      id: 'healthy-allowance',
      type: 'opportunity',
      title: 'Strong Financial Pacing',
      description: `You have ₹${Math.round(summary.dailyAllowance)}/day available. You could allocate ₹500 to your savings goals without endangering commitments.`,
      impactAmount: 500,
      suggestedAction: {
        label: 'Contribute to Savings',
        actionType: 'view_goals'
      }
    });
  }

  // 4. Savings Goal Feasibility
  state.savingsGoals.forEach(g => {
    const remaining = g.targetAmount - g.currentAmount;
    if (remaining <= 0) {
      insights.push({
        id: `goal-complete-${g.id}`,
        type: 'achievement',
        title: `Goal "${g.name}" Achieved! 🎯`,
        description: `You successfully saved ₹${g.currentAmount.toLocaleString('en-IN')}! This amount remains protected in your safety reserve.`,
        suggestedAction: {
          label: 'View Savings',
          actionType: 'view_goals'
        }
      });
    } else if (remaining > summary.discretionaryBalance && summary.discretionaryBalance > 0) {
      insights.push({
        id: `goal-tight-${g.id}`,
        type: 'tip',
        title: `Goal "${g.name}" Needs Adjustment`,
        description: `Remaining target is ₹${remaining.toLocaleString('en-IN')}, but available discretionary balance is ₹${summary.discretionaryBalance.toLocaleString('en-IN')}. Extending the timeline or contributing smaller increments will protect your runway.`,
        suggestedAction: {
          label: 'Simulate in Lens',
          actionType: 'open_lens'
        }
      });
    }
  });

  // 5. Subscription Drain Check
  const activeSubs = state.subscriptions.filter(s => s.isActive);
  const totalSubMonthly = activeSubs.reduce((s, sub) => s + sub.amount, 0);
  if (totalSubMonthly > 0) {
    const subPctOfBudget = (totalSubMonthly / state.initialBudget) * 100;
    if (subPctOfBudget >= 5) {
      insights.push({
        id: 'sub-drain',
        type: 'tip',
        title: 'Subscription Overhead',
        description: `Active subscriptions total ₹${totalSubMonthly.toLocaleString('en-IN')}/month (${Math.round(subPctOfBudget)}% of your ₹10,000 budget). Check if any can be paused.`,
        impactAmount: totalSubMonthly,
        suggestedAction: {
          label: 'Review Subscriptions',
          actionType: 'open_lens'
        }
      });
    }
  }

  return insights;
}
