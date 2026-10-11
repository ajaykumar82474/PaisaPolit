# PaisaPilot — The 30-Day Money Lab
### A Decision-Driven Personal Finance Experience for Gen Z

> **"Make every rupee count. Preview the consequences before you commit."**

---

## ⚡ Executive Summary

**PaisaPilot** is not a passive expense tracker. It is an interactive money-management laboratory designed specifically for Gen Z and students managing a limited **₹10,000 budget over a 30-day period**.

Rather than merely recording historical expenses, PaisaPilot empowers users to **simulate financial decisions beforehand**, clearly visualizing how each choice impacts:
1. **Available Discretionary Balance** (Money actually safe to spend)
2. **Daily Spending Allowance** (Remaining daily run-rate cap)
3. **Protected Commitments** (Reserved rent, wifi, utilities)
4. **Savings Goals** (Feasibility & progress toward targets)
5. **30-Day Forecast & Cash Runway**
6. **Transparent Financial Health Score & Risk Level**

### The Defining Loop:
$$\text{DECISION} \longrightarrow \text{SIMULATION} \longrightarrow \text{CONSEQUENCE} \longrightarrow \text{COMPARISON} \longrightarrow \text{COMMIT OR CANCEL}$$

---

## 🧭 The Five Core Questions

PaisaPilot guarantees answers to five essential questions at all times:

| Question | PaisaPilot Answer |
| :--- | :--- |
| **1. How much money do I actually have?** | Discretionary Balance ($D = B_0 + I - E - S - C$), separating ledger cash from promised rent and protected savings. |
| **2. How much can I safely spend each day?** | Dynamic Daily Allowance ($D / \text{remaining days}$), updating in real time with zero-division safeguards. |
| **3. What happens if I make this choice?** | **Decision Lens™** provides an isolated before-and-after preview with absolute $\Delta$ impacts. |
| **4. Will I still meet commitments & goals?** | Real-time threat detection flags if any purchase imperils upcoming rent or goal timelines. |
| **5. What should I change to improve?** | Deterministic, rule-based contextual insights and an explainable 100-point Financial Health model. |

---

## 🎨 Visual Identity & Signatures

* **Editorial Gen Z Fintech Palette**:
  * Deep Ink & Midnight Navy surfaces (`#060911`, `#0B101E`)
  * Electric Lime positive action & discretionary funds accent (`#10E57A`)
  * Electric Purple simulation accent (`#7C3AED`)
  * Amber & Coral risk warnings (`#F59E0B`, `#EF4444`)
  * Indian Rupee formatting (`₹10,000`, `₹2,450`, `-₹800`)
* **Signature 1: Money Pulse™**:
  * Coordinated proportional flow visualization linking Starting Funds $\to$ Spent Outflow $\to$ Reserved Commitments $\to$ Protected Savings $\to$ Available Discretionary Runway.
* **Signature 2: Decision Lens™**:
  * Full-fledged simulation workbench with side-by-side scenario comparison, threat detection, and idempotent commits.

---

## 🏗️ Architecture & Technology Stack

* **Frontend Framework**: React 19 + TypeScript (ES2023)
* **Build System**: Vite 8
* **Styling**: Tailwind CSS 3.4 with custom typography and glow utilities
* **Icons**: Lucide React
* **Testing Suite**: Vitest (11/11 automated acceptance tests passing)
* **Persistence**: LocalStorage repository abstraction with schema validation, export/import JSON, and instant demo reset.

### Mathematical Domain Model (Single Source of Truth)
* $B_0$: Initial budget (₹10,000)
* $I$: Additional income received
* $E$: Actual recorded expenses
* $S$: Protected savings locked in goals
* $C$: Unpaid commitments reserved for future payment (pending / overdue)
* **Ledger Balance**: $B = B_0 + I - E$
* **Available Discretionary Balance**: $D = B - S - C$
* **Daily Allowance**: $\text{Daily} = \frac{D}{\max(1, \text{remaining days})}$ (when remaining days $> 0$, else final position)
* **Paying a commitment**: Releases commitment reservation ($C \to C - \text{amt}$) and simultaneously records ledger expense ($E \to E + \text{amt}$), ensuring discretionary balance $D$ is never double deducted!

---

## 🚀 Getting Started

### Prerequisites
* Node.js v18+ (tested on Node v24.18.0)
* npm v10+

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Run unit & acceptance tests
npm test

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```

The application runs locally at: `http://localhost:5173`

---

## 🧪 Acceptance Test Suite (Tests A through K)

All 11 acceptance scenarios specified in the master directive are implemented and verified via Vitest:

| Test | Objective | Status |
| :--- | :--- | :--- |
| **Test A: Initial Budget** | ₹10k budget, 30 days, ledger ₹10k, savings ₹0, commitments ₹0, discretionary ₹10k. | ✅ PASSED |
| **Test B: Add Expense** | Record ₹500 expense; ledger & discretionary balance decrease to ₹9,500. | ✅ PASSED |
| **Test C: Simulate Purchase** | Simulate ₹800 expense; previews consequence while baseline remains untouched at ₹10k. | ✅ PASSED |
| **Test D: Apply Decision** | Apply simulated ₹800 purchase; records exactly 1 expense, ledger updates to ₹9,200. | ✅ PASSED |
| **Test E: Cancel Simulation** | Cancelling preview restores baseline financial state with 0 mutations. | ✅ PASSED |
| **Test F: Protect Savings** | Reserving ₹2,000 in savings protects money without double deducting from wealth. | ✅ PASSED |
| **Test G: Commitments Flow** | Unpaid commitment reserves funds; paying releases reservation and records expense once. | ✅ PASSED |
| **Test H: Boundary & Deficit** | 0 days remaining handles division by zero safely; negative balance displays honest deficit. | ✅ PASSED |
| **Test I: Persistence** | Serializing and rehydrating state preserves identical derived balances. | ✅ PASSED |
| **Test J: Scenario Comparison** | Side-by-side alternative comparison (Buy Now vs Budget Alt) preserves fixed baseline. | ✅ PASSED |
| **Test K: Forecast Dynamic Recalculation** | Updating an expense dynamically recalculates forward-looking 30-day forecast. | ✅ PASSED |

---

## 🏆 Hackathon Demo Walkthrough Path

For quick evaluation during demonstrations:
1. **Explore Overview**: Notice the dominant Available Runway (₹4,200) and Money Pulse flow bar.
2. **Top Demo Tour Bar**:
   * Click **"1: Simulate ₹1,500 Ticket"** to open Decision Lens with prefilled parameters.
   * Click **"2: Compare 3 Alternatives"** to see side-by-side comparison (Option A vs Option B vs Option C).
   * Click **"3: Pay PG Rent (₹2,500)"** to observe reservation release into recorded expense.
   * Click **"Reset Demo"** at any time to restore pristine Day 8 state.
