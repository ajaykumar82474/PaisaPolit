// src/domain/healthScore.ts
import { HealthScoreBreakdown, RiskLevel } from '../types/finance';

interface HealthInputs {
  discretionaryBalance: number;
  ledgerBalance: number;
  unpaidCommitments: number;
  protectedSavings: number;
  totalSavingsTarget: number;
  currentDay: number;
  remainingDays: number;
  initialBudget: number;
  dailyAllowance: number;
  actualDailyBurn: number;
}

export function calculateHealthScore(inputs: HealthInputs): HealthScoreBreakdown {
  const {
    discretionaryBalance,
    ledgerBalance,
    unpaidCommitments,
    protectedSavings,
    totalSavingsTarget,
    currentDay,
    remainingDays,
    initialBudget,
    actualDailyBurn,
  } = inputs;

  const recommendations: string[] = [];

  // 1. Discretionary Cushion (Max 30 points)
  // Evaluates if discretionary funds are positive and adequate for remaining days
  let discretionaryScore = 0;
  if (discretionaryBalance > 0) {
    const idealRemainingNeeded = (initialBudget / 30) * Math.max(1, remainingDays);
    const cushionRatio = discretionaryBalance / Math.max(1, idealRemainingNeeded);
    discretionaryScore = Math.min(30, Math.round(cushionRatio * 30));
  } else {
    discretionaryScore = 0;
    recommendations.push('Immediate action needed: Discretionary balance is negative. Pause all non-essential purchases.');
  }

  // 2. Commitment Coverage (Max 25 points)
  // Can available ledger balance comfortably pay unpaid commitments?
  let commitmentScore = 25;
  if (unpaidCommitments > 0) {
    if (ledgerBalance >= unpaidCommitments) {
      const surplus = ledgerBalance - unpaidCommitments;
      if (surplus >= unpaidCommitments * 0.25) {
        commitmentScore = 25;
      } else {
        commitmentScore = 18;
        recommendations.push('Upcoming commitments leave very little cushion. Keep reserved funds untouched.');
      }
    } else {
      // Inability to pay commitments!
      const coverageRatio = Math.max(0, ledgerBalance / unpaidCommitments);
      commitmentScore = Math.round(coverageRatio * 12);
      recommendations.push(`Critical: Ledger balance (₹${ledgerBalance.toLocaleString('en-IN')}) is less than promised commitments (₹${unpaidCommitments.toLocaleString('en-IN')}).`);
    }
  } else {
    commitmentScore = 25;
  }

  // 3. Savings Feasibility & Progress (Max 20 points)
  let savingsScore = 15; // default neutral if no goals
  if (totalSavingsTarget > 0) {
    const savedRatio = protectedSavings / totalSavingsTarget;
    // Expected progress based on current day progression (day / 30)
    const expectedProgress = Math.min(1, currentDay / 30);
    if (savedRatio >= expectedProgress) {
      savingsScore = Math.min(20, Math.round(10 + (savedRatio * 10)));
    } else {
      savingsScore = Math.max(5, Math.round(savedRatio * 15));
      recommendations.push('Savings goals are trailing behind schedule. Consider allocating surplus daily funds.');
    }
  } else {
    savingsScore = 15;
  }

  // 4. Pacing & Burn Rate (Max 15 points)
  // Compares daily burn rate with target daily allowance
  let pacingScore = 15;
  const benchmarkDaily = initialBudget / 30; // e.g. ₹333/day
  if (currentDay > 1 && actualDailyBurn > 0) {
    if (actualDailyBurn <= benchmarkDaily) {
      pacingScore = 15;
    } else if (actualDailyBurn <= benchmarkDaily * 1.3) {
      pacingScore = 10;
      recommendations.push(`Daily burn rate (₹${Math.round(actualDailyBurn)}/day) is slightly above the ₹${Math.round(benchmarkDaily)}/day baseline.`);
    } else {
      pacingScore = 4;
      recommendations.push(`High burn rate: Spending ₹${Math.round(actualDailyBurn)}/day will exhaust remaining funds early.`);
    }
  }

  // 5. Emergency Buffer (Max 10 points)
  // Has user maintained at least 10% of initial budget untouched or in protected savings?
  let bufferScore = 0;
  const emergencyThreshold = initialBudget * 0.10; // e.g. ₹1,000
  const totalCushion = Math.max(0, discretionaryBalance) + protectedSavings;
  if (totalCushion >= emergencyThreshold * 2) {
    bufferScore = 10;
  } else if (totalCushion >= emergencyThreshold) {
    bufferScore = 7;
  } else if (totalCushion > 0) {
    bufferScore = 4;
    recommendations.push('Emergency buffer is low (under ₹1,000). Try setting aside an emergency cushion.');
  } else {
    bufferScore = 0;
  }

  let rawScore = discretionaryScore + commitmentScore + savingsScore + pacingScore + bufferScore;

  // Severe Deficit Penalizer: If in debt or deficit, cap health score into Critical tier (<40)
  if (discretionaryBalance < 0 || ledgerBalance < 0) {
    const deficitPenalty = Math.min(30, Math.round(Math.abs(Math.min(discretionaryBalance, ledgerBalance)) / 100));
    rawScore = Math.max(0, Math.min(35, rawScore - deficitPenalty));
  }

  const totalScore = Math.max(0, Math.min(100, rawScore));

  let tier: HealthScoreBreakdown['tier'] = 'Stable';
  if (totalScore >= 80) tier = 'Thriving';
  else if (totalScore >= 60) tier = 'Stable';
  else if (totalScore >= 40) tier = 'Cautious';
  else tier = 'Critical';

  if (recommendations.length === 0) {
    recommendations.push('Your finances are well-balanced. Keep maintaining your daily spending allowance.');
  }

  return {
    totalScore,
    tier,
    factors: {
      discretionaryCushion: {
        score: discretionaryScore,
        max: 30,
        label: 'Discretionary Cushion',
        desc: `Available funds vs remaining ${remainingDays} days required runway.`
      },
      commitmentCoverage: {
        score: commitmentScore,
        max: 25,
        label: 'Commitment Coverage',
        desc: 'Ability of ledger balance to satisfy all unpaid obligations.'
      },
      savingsFeasibility: {
        score: savingsScore,
        max: 20,
        label: 'Savings Feasibility',
        desc: 'Progress towards targets without jeopardizing commitments.'
      },
      pacingAndBurnRate: {
        score: pacingScore,
        max: 15,
        label: 'Spending Pacing',
        desc: 'Comparison of real-world daily spend against the ₹333/day budget baseline.'
      },
      emergencyBuffer: {
        score: bufferScore,
        max: 10,
        label: 'Safety Buffer',
        desc: 'Presence of emergency reserves (minimum 10% of budget).'
      }
    },
    recommendations
  };
}

export function calculateRiskLevel(
  discretionaryBalance: number,
  ledgerBalance: number,
  unpaidCommitments: number,
  remainingDays: number,
  dailyAllowance: number
): { level: RiskLevel; reason: string } {
  // Critical Risk
  if (discretionaryBalance < 0) {
    return {
      level: 'critical',
      reason: `Deficit Alert: Discretionary balance is in negative shortfall by ₹${Math.abs(discretionaryBalance).toLocaleString('en-IN')}. Immediate spending freeze advised.`
    };
  }

  if (ledgerBalance < unpaidCommitments) {
    return {
      level: 'critical',
      reason: `Commitment Shortfall: Ledger funds cannot cover upcoming commitments (shortfall of ₹${(unpaidCommitments - ledgerBalance).toLocaleString('en-IN')}).`
    };
  }

  // High Risk
  if (remainingDays > 5 && dailyAllowance < 50) {
    return {
      level: 'high',
      reason: `Tight Allowance: Daily spending limit is under ₹50/day with ${remainingDays} days still remaining in the month.`
    };
  }

  if (discretionaryBalance < 500 && remainingDays > 10) {
    return {
      level: 'high',
      reason: `Low Runway: Only ₹${discretionaryBalance.toLocaleString('en-IN')} available for the next ${remainingDays} days.`
    };
  }

  // Moderate Risk
  if (dailyAllowance < 150 && remainingDays > 5) {
    return {
      level: 'moderate',
      reason: `Restricted Spending: Daily allowance of ₹${Math.round(dailyAllowance)}/day requires mindful discipline.`
    };
  }

  // Low Risk
  return {
    level: 'low',
    reason: `Healthy Trajectory: Full commitment coverage and safe daily allowance of ₹${Math.round(dailyAllowance)}/day.`
  };
}
