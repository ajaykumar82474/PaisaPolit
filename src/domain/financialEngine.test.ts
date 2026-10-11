// src/domain/financialEngine.test.ts
import { describe, it, expect } from 'vitest';
import { calculateFinancialSummary, simulateDecision } from './financialEngine';
import { getPristineState } from '../storage/initialState';
import { AppState, DecisionSimulation } from '../types/finance';

describe('PaisaPilot Financial Engine - Acceptance Tests', () => {
  // Test A: Initial budget
  it('Test A: Initial budget of ₹10,000 with no transactions or commitments', () => {
    const state = getPristineState();
    const summary = calculateFinancialSummary(state);

    expect(summary.ledgerBalance).toBe(10000);
    expect(summary.protectedSavings).toBe(0);
    expect(summary.unpaidCommitments).toBe(0);
    expect(summary.discretionaryBalance).toBe(10000);
    expect(summary.totalDays).toBe(30);
    expect(summary.remainingDays).toBe(30);
    expect(summary.dailyAllowance).toBeCloseTo(333.33, 1);
    expect(summary.isShortfall).toBe(false);
  });

  // Test B: Add an expense
  it('Test B: Recording a ₹500 expense reduces ledger and discretionary balance', () => {
    const state = getPristineState();
    state.transactions.push({
      id: 'tx-1',
      type: 'expense',
      amount: 500,
      category: 'Food & Chai',
      description: 'Campus lunch',
      day: 1,
      date: '2026-10-01',
      createdAt: new Date().toISOString(),
    });

    const summary = calculateFinancialSummary(state);

    expect(summary.totalExpenses).toBe(500);
    expect(summary.ledgerBalance).toBe(9500);
    expect(summary.discretionaryBalance).toBe(9500);
    expect(summary.protectedSavings).toBe(0);
    expect(summary.unpaidCommitments).toBe(0);
    expect(summary.dailyAllowance).toBeCloseTo(9500 / 30, 2);
  });

  // Test C: Simulate a purchase
  it('Test C: Simulating an immediate ₹800 expense previews consequence without modifying baseline', () => {
    const baseline = getPristineState();
    const decision: DecisionSimulation = {
      type: 'discretionary_purchase',
      title: 'Concert pass',
      amount: 800,
      day: 1,
      category: 'Entertainment & OTT',
    };

    const consequence = simulateDecision(baseline, decision);

    // Baseline remains untouched
    expect(baseline.transactions.length).toBe(0);
    const baselineSummary = calculateFinancialSummary(baseline);
    expect(baselineSummary.ledgerBalance).toBe(10000);
    expect(baselineSummary.discretionaryBalance).toBe(10000);

    // Simulated consequence shows expected deltas
    expect(consequence.simulatedSummary.ledgerBalance).toBe(9200);
    expect(consequence.simulatedSummary.discretionaryBalance).toBe(9200);
    expect(consequence.deltas.discretionaryDelta).toBe(-800);
    expect(consequence.simulatedSummary.dailyAllowance).toBeCloseTo(9200 / 30, 1);
    expect(consequence.deltas.dailyAllowanceDelta).toBeCloseTo(-800 / 30, 1);
  });

  // Test D: Apply the decision
  it('Test D: Applying the ₹800 purchase records exactly one expense and updates state', () => {
    const state = getPristineState();
    const purchaseAmount = 800;

    // Apply operation
    state.transactions.push({
      id: 'tx-applied-800',
      type: 'expense',
      amount: purchaseAmount,
      category: 'Entertainment & OTT',
      description: 'Concert pass',
      day: 1,
      date: '2026-10-01',
      createdAt: new Date().toISOString(),
    });

    const summary = calculateFinancialSummary(state);
    expect(state.transactions.length).toBe(1);
    expect(summary.ledgerBalance).toBe(9200);
    expect(summary.discretionaryBalance).toBe(9200);
  });

  // Test E: Cancel a simulation
  it('Test E: Cancelling a simulation discards preview and preserves baseline', () => {
    const baseline = getPristineState();
    const decision: DecisionSimulation = {
      type: 'discretionary_purchase',
      title: 'Sneakers',
      amount: 2500,
      day: 1,
      category: 'Shopping & Fashion',
    };

    // Run simulation
    const consequence = simulateDecision(baseline, decision);
    expect(consequence.simulatedSummary.discretionaryBalance).toBe(7500);

    // Cancel simulation (baseline was never mutated)
    const activeSummary = calculateFinancialSummary(baseline);
    expect(activeSummary.discretionaryBalance).toBe(10000);
    expect(baseline.transactions.length).toBe(0);
    expect(baseline.commitments.length).toBe(0);
    expect(baseline.savingsGoals.length).toBe(0);
  });

  // Test F: Protect savings without double subtraction
  it('Test F: Reserving ₹2,000 as savings protects money without reducing total funds twice', () => {
    const state = getPristineState();
    // User saves ₹2,000 in a savings goal
    state.savingsGoals.push({
      id: 'goal-emergency',
      name: 'Emergency Fund',
      targetAmount: 5000,
      currentAmount: 2000,
      targetDay: 30,
      contributions: [
        { id: 'c1', amount: 2000, day: 1, date: '2026-10-01' }
      ],
      createdAt: new Date().toISOString(),
    });

    const summary = calculateFinancialSummary(state);

    // Ledger balance still has the ₹10,000 (money was saved, not spent outside)
    expect(summary.ledgerBalance).toBe(10000);
    // Protected savings is ₹2,000
    expect(summary.protectedSavings).toBe(2000);
    // Available discretionary balance is reduced to ₹8,000
    expect(summary.discretionaryBalance).toBe(8000);
    // Total wealth = ledger balance (not deducted twice)
    expect(summary.ledgerBalance).toBe(summary.discretionaryBalance + summary.protectedSavings);
  });

  // Test G: Commitments - reserving and paying
  it('Test G: Unpaid commitment reserves funds; paying releases reservation and records expense once', () => {
    const state = getPristineState();
    // 1. Create an unpaid ₹1,500 commitment (PG rent)
    state.commitments.push({
      id: 'commit-rent',
      title: 'PG Room Rent',
      amount: 1500,
      dueDay: 10,
      dueDate: '2026-10-10',
      category: 'Other',
      status: 'pending',
    });

    let summary = calculateFinancialSummary(state);
    expect(summary.unpaidCommitments).toBe(1500);
    expect(summary.ledgerBalance).toBe(10000); // Not paid yet
    expect(summary.discretionaryBalance).toBe(8500); // 10000 - 1500

    // 2. Pay the commitment
    const commitment = state.commitments[0];
    commitment.status = 'paid';
    commitment.paidTransactionId = 'tx-rent-paid';

    state.transactions.push({
      id: 'tx-rent-paid',
      type: 'expense',
      amount: 1500,
      category: 'Other',
      description: 'Paid: PG Room Rent',
      day: 10,
      date: '2026-10-10',
      relatedCommitmentId: commitment.id,
      createdAt: new Date().toISOString(),
    });

    summary = calculateFinancialSummary(state);
    // Unpaid commitments reservation released to 0
    expect(summary.unpaidCommitments).toBe(0);
    // Ledger balance decreased by 1500 to 8500
    expect(summary.ledgerBalance).toBe(8500);
    // Discretionary balance remains consistent (8500) without double deduction!
    expect(summary.discretionaryBalance).toBe(8500);
  });

  // Test H: Invalid and boundary inputs
  it('Test H: Boundary tests - zero days remaining, negative discretionary balance, large numbers', () => {
    const state = getPristineState();
    // Advance day to 31 (past period)
    state.currentDay = 31;
    let summary = calculateFinancialSummary(state);
    expect(summary.remainingDays).toBe(0);
    expect(summary.dailyAllowance).toBe(0); // No division by zero, no NaN!
    expect(isNaN(summary.dailyAllowance)).toBe(false);

    // Negative discretionary balance (shortfall)
    state.currentDay = 15;
    state.transactions.push({
      id: 'tx-large-expense',
      type: 'expense',
      amount: 12000,
      category: 'Emergency',
      description: 'Major medical emergency',
      day: 15,
      date: '2026-10-15',
      createdAt: new Date().toISOString(),
    });

    summary = calculateFinancialSummary(state);
    // Ledger balance is -2000
    expect(summary.ledgerBalance).toBe(-2000);
    // Discretionary balance is -2000 (never silently clamped to 0)
    expect(summary.discretionaryBalance).toBe(-2000);
    expect(summary.isShortfall).toBe(true);
    expect(summary.shortfallAmount).toBe(2000);
    expect(summary.riskLevel).toBe('critical');
    expect(summary.healthScore.tier).toBe('Critical');
  });

  // Test I: Persistence & State Rehydration
  it('Test I: State can be serialized, rehydrated, and maintains identical derived metrics', () => {
    const original = getPristineState();
    original.transactions.push({
      id: 'tx-persisted-1',
      type: 'expense',
      amount: 450,
      category: 'Food & Chai',
      description: 'Groceries',
      day: 5,
      date: '2026-10-05',
      createdAt: new Date().toISOString(),
    });
    original.commitments.push({
      id: 'c-persisted-1',
      title: 'Mobile Bill',
      amount: 299,
      dueDay: 15,
      dueDate: '2026-10-15',
      category: 'Mobile & Wifi',
      status: 'pending',
    });

    const serialized = JSON.stringify(original);
    const restored: AppState = JSON.parse(serialized);

    const origSummary = calculateFinancialSummary(original);
    const restSummary = calculateFinancialSummary(restored);

    expect(restSummary.ledgerBalance).toBe(origSummary.ledgerBalance);
    expect(restSummary.discretionaryBalance).toBe(origSummary.discretionaryBalance);
    expect(restSummary.unpaidCommitments).toBe(origSummary.unpaidCommitments);
    expect(restSummary.dailyAllowance).toBe(origSummary.dailyAllowance);
    expect(restSummary.healthScore.totalScore).toBe(origSummary.healthScore.totalScore);
  });

  // Test J: Scenario Comparison between alternatives
  it('Test J: Scenario comparison cleanly compares multiple alternatives without mutating baseline', () => {
    const baseline = getPristineState();
    
    // Alt 1: Full price ₹1,500
    const altA: DecisionSimulation = {
      type: 'discretionary_purchase',
      title: 'VIP Pass',
      amount: 1500,
      day: 5,
      category: 'Entertainment & OTT',
    };
    // Alt 2: Budget pass ₹600
    const altB: DecisionSimulation = {
      type: 'discretionary_purchase',
      title: 'Standard Pass',
      amount: 600,
      day: 5,
      category: 'Entertainment & OTT',
    };

    const resA = simulateDecision(baseline, altA);
    const resB = simulateDecision(baseline, altB);

    expect(resA.simulatedSummary.discretionaryBalance).toBe(8500);
    expect(resB.simulatedSummary.discretionaryBalance).toBe(9400);

    // Baseline stays fixed at ₹10,000
    expect(calculateFinancialSummary(baseline).discretionaryBalance).toBe(10000);
    // Alt B preserves ₹900 more than Alt A
    expect(resB.simulatedSummary.discretionaryBalance - resA.simulatedSummary.discretionaryBalance).toBe(900);
  });

  // Test K: Forecast recalculation consistency
  it('Test K: Changing an expense or commitment dynamically updates forecast calculation', () => {
    const state = getPristineState();
    const summary1 = calculateFinancialSummary(state);
    expect(summary1.discretionaryBalance).toBe(10000);

    // User adds unexpected expense of ₹1,000
    state.transactions.push({
      id: 'tx-unexpected',
      type: 'expense',
      amount: 1000,
      category: 'Emergency',
      description: 'Emergency bike repair',
      day: 4,
      date: '2026-10-04',
      createdAt: new Date().toISOString(),
    });

    const summary2 = calculateFinancialSummary(state);
    expect(summary2.ledgerBalance).toBe(9000);
    expect(summary2.discretionaryBalance).toBe(9000);
    expect(summary2.dailyAllowance).toBeLessThan(summary1.dailyAllowance);
  });
});
