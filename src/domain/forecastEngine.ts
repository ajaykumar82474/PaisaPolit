// src/domain/forecastEngine.ts
import { AppState, DayForecastPoint } from '../types/finance';
import { calculateFinancialSummary, roundRupees } from './financialEngine';

export function generate30DayForecast(state: AppState): DayForecastPoint[] {
  const summary = calculateFinancialSummary(state);
  const totalDays = state.totalDays || 30;
  const currentDay = state.currentDay || 1;
  const points: DayForecastPoint[] = [];

  // Group transactions by day
  const expensesByDay = new Map<number, number>();
  const incomeByDay = new Map<number, number>();
  state.transactions.forEach(t => {
    if (t.type === 'expense') {
      expensesByDay.set(t.day, (expensesByDay.get(t.day) || 0) + t.amount);
    } else {
      incomeByDay.set(t.day, (incomeByDay.get(t.day) || 0) + t.amount);
    }
  });

  // Future commitments by day
  const commitmentsByDay = new Map<number, { amount: number; title: string }[]>();
  state.commitments
    .filter(c => c.status === 'pending' || c.status === 'overdue')
    .forEach(c => {
      const existing = commitmentsByDay.get(c.dueDay) || [];
      existing.push({ amount: c.amount, title: c.title });
      commitmentsByDay.set(c.dueDay, existing);
    });

  // Future active subscriptions by day
  const subscriptionsByDay = new Map<number, { amount: number; name: string }[]>();
  state.subscriptions
    .filter(s => s.isActive)
    .forEach(s => {
      const existing = subscriptionsByDay.get(s.billingDay) || [];
      existing.push({ amount: s.amount, name: s.name });
      subscriptionsByDay.set(s.billingDay, existing);
    });

  // Reconstruct trajectory
  let runningLedger = state.initialBudget;
  let runningStress = state.initialBudget;
  let runningBest = state.initialBudget;

  const baselineDailyAllowance = Math.max(0, summary.dailyAllowance);
  const bestCaseDailyAllowance = Math.max(0, baselineDailyAllowance * 0.75); // 25% lower spending

  for (let day = 1; day <= totalDays; day++) {
    const dayEvents: string[] = [];
    let scheduledCommitmentTotal = 0;
    let scheduledSubTotal = 0;
    let expectedDiscretionary = 0;

    const openingBalance = runningLedger;

    if (day < currentDay) {
      // Historical Day
      const dayExpense = expensesByDay.get(day) || 0;
      const dayIncome = incomeByDay.get(day) || 0;
      runningLedger = roundRupees(runningLedger + dayIncome - dayExpense);
      runningStress = runningLedger;
      runningBest = runningLedger;

      if (dayExpense > 0) dayEvents.push(`Spent ₹${dayExpense.toLocaleString('en-IN')}`);
      if (dayIncome > 0) dayEvents.push(`Received ₹${dayIncome.toLocaleString('en-IN')}`);
    } else if (day === currentDay) {
      // Today
      // Current day balance is the actual current ledger balance
      runningLedger = summary.ledgerBalance;
      runningStress = summary.ledgerBalance;
      runningBest = summary.ledgerBalance;
      dayEvents.push('Today');
    } else {
      // Future Day Projection
      // Check upcoming commitments
      const commitments = commitmentsByDay.get(day);
      if (commitments) {
        commitments.forEach(c => {
          scheduledCommitmentTotal += c.amount;
          dayEvents.push(`Due: ${c.title} (₹${c.amount})`);
        });
      }

      // Check upcoming subscriptions
      const subs = subscriptionsByDay.get(day);
      if (subs) {
        subs.forEach(s => {
          scheduledSubTotal += s.amount;
          dayEvents.push(`Sub: ${s.name} (₹${s.amount})`);
        });
      }

      expectedDiscretionary = baselineDailyAllowance;

      // Deduct from baseline projection
      runningLedger = roundRupees(runningLedger - scheduledCommitmentTotal - scheduledSubTotal - expectedDiscretionary);
      
      // Best case: spend less discretionary
      runningBest = roundRupees(runningBest - scheduledCommitmentTotal - scheduledSubTotal - bestCaseDailyAllowance);

      // Stress case: baseline + surprise ₹1,200 emergency at day 20 (or middle of remaining days)
      const stressTestDay = Math.min(totalDays - 2, Math.max(currentDay + 2, 20));
      let stressShock = 0;
      if (day === stressTestDay) {
        stressShock = 1200;
        dayEvents.push('Stress Event: Surprise expense ₹1,200');
      }
      runningStress = roundRupees(runningStress - scheduledCommitmentTotal - scheduledSubTotal - expectedDiscretionary - stressShock);
    }

    points.push({
      day,
      openingBalance: roundRupees(openingBalance),
      scheduledCommitments: roundRupees(scheduledCommitmentTotal),
      scheduledSubscriptions: roundRupees(scheduledSubTotal),
      expectedDiscretionarySpend: roundRupees(expectedDiscretionary),
      closingBalance: runningLedger,
      bestCaseBalance: runningBest,
      stressCaseBalance: runningStress,
      events: dayEvents,
    });
  }

  return points;
}
