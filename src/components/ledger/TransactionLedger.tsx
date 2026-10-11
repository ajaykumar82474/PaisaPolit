// src/components/ledger/TransactionLedger.tsx
import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType, Category } from '../../types/finance';
import { formatRupee } from '../common/CurrencyDisplay';
import { 
  Receipt, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  X, 
  AlertCircle
} from 'lucide-react';

const CATEGORIES: Category[] = [
  'Food & Chai',
  'Metro & Transport',
  'College & Books',
  'Mobile & Wifi',
  'Entertainment & OTT',
  'Shopping & Fashion',
  'Healthcare',
  'Emergency',
  'Other',
];

export const TransactionLedger: React.FC = () => {
  const { state, summary, addTransaction, editTransaction, deleteTransaction } = useFinance();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);

  // Form states for Add/Edit
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState<number | ''>('');
  const [formCategory, setFormCategory] = useState<Category>('Food & Chai');
  const [formDay, setFormDay] = useState<number>(state.currentDay);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered & Sorted list
  const filteredTransactions = useMemo(() => {
    return state.transactions.filter(t => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesNotes = t.notes?.toLowerCase().includes(query);
        const matchesCat = t.category.toLowerCase().includes(query);
        if (!matchesDesc && !matchesNotes && !matchesCat) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return b.day - a.day;
      if (sortBy === 'date_asc') return a.day - b.day;
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });
  }, [state.transactions, typeFilter, categoryFilter, searchQuery, sortBy]);

  const handleOpenAdd = () => {
    setFormType('expense');
    setFormDescription('');
    setFormAmount('');
    setFormCategory('Food & Chai');
    setFormDay(state.currentDay);
    setFormNotes('');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setFormType(tx.type);
    setFormDescription(tx.description);
    setFormAmount(tx.amount);
    setFormCategory(tx.category);
    setFormDay(tx.day);
    setFormNotes(tx.notes || '');
    setFormError(null);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim()) {
      setFormError('Please enter a description');
      return;
    }
    if (!formAmount || formAmount <= 0) {
      setFormError('Please enter a valid amount greater than ₹0');
      return;
    }

    if (editingTransaction) {
      editTransaction(editingTransaction.id, {
        type: formType,
        description: formDescription.trim(),
        amount: Number(formAmount),
        category: formCategory,
        day: Number(formDay),
        notes: formNotes.trim() || undefined,
      });
      setEditingTransaction(null);
    } else {
      addTransaction({
        type: formType,
        description: formDescription.trim(),
        amount: Number(formAmount),
        category: formCategory,
        day: Number(formDay),
        date: new Date().toISOString().split('T')[0],
        notes: formNotes.trim() || undefined,
      });
      setIsAddModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingTransactionId) {
      deleteTransaction(deletingTransactionId);
      setDeletingTransactionId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-900 border border-navy-750 p-6 rounded-2xl shadow-card-dark">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand-lime" />
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              The Spending Ledger
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete record of actual income and expenses within your ₹10,000 budget.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Expenses</div>
            <div className="text-lg font-mono font-bold text-rose-400">
              -{formatRupee(summary.totalExpenses)}
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-brand-lime hover:bg-brand-limeHover text-navy-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-glow-lime"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-navy-900 border border-navy-750 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by description or notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-navy-950 border border-navy-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="bg-navy-950 border border-navy-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-navy-950 border border-navy-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-navy-950 border border-navy-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="date_desc">Latest Day First</option>
            <option value="date_asc">Earliest Day First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-navy-900 border border-navy-750 rounded-2xl shadow-card-dark overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950/70 border-b border-navy-800 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Day</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-navy-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                      Day {tx.day}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{tx.description}</div>
                      {tx.notes && <div className="text-[11px] text-slate-500 mt-0.5">{tx.notes}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-navy-800 text-slate-300 border border-navy-700 text-[10px]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                      <span className={tx.type === 'expense' ? 'text-rose-400' : 'text-brand-lime'}>
                        {tx.type === 'expense' ? '-' : '+'}{formatRupee(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-navy-800 transition-colors"
                          title="Edit transaction"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingTransactionId(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-navy-800 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-2">
            <Receipt className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">No transactions match your search</div>
            <p className="text-xs text-slate-500">Try adjusting your filters or record a new transaction.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      {(isAddModalOpen || editingTransaction) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-navy-900 border border-navy-700 w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
              <h3 className="text-base font-bold text-white">
                {editingTransaction ? 'Edit Transaction' : 'Record New Transaction'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTransaction(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormType('expense')}
                  className={`py-2 rounded-lg font-bold border transition-colors ${
                    formType === 'expense'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                      : 'bg-navy-950 text-slate-400 border-navy-800'
                  }`}
                >
                  Expense (-)
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('income')}
                  className={`py-2 rounded-lg font-bold border transition-colors ${
                    formType === 'income'
                      ? 'bg-brand-lime/20 text-brand-lime border-brand-lime/50'
                      : 'bg-navy-950 text-slate-400 border-navy-800'
                  }`}
                >
                  Income (+)
                </button>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metro smart card recharge"
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-lime"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="e.g. 400"
                  value={formAmount}
                  onChange={e => setFormAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-navy-950 border border-navy-800 rounded-lg px-3 py-2 font-mono text-sm font-bold text-white focus:outline-none focus:border-brand-lime"
                />
              </div>

              {/* Category & Day */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as Category)}
                    className="w-full bg-navy-950 border border-navy-800 rounded-lg px-2.5 py-2 text-white focus:outline-none"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Day of Period (1-30)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formDay}
                    onChange={e => setFormDay(Number(e.target.value))}
                    className="w-full bg-navy-950 border border-navy-800 rounded-lg px-2.5 py-2 font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Optional Notes</label>
                <input
                  type="text"
                  placeholder="Any extra context or split details"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTransaction(null);
                  }}
                  className="px-4 py-2 bg-navy-800 hover:bg-navy-750 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-lime hover:bg-brand-limeHover text-navy-950 font-bold rounded-lg shadow-glow-lime"
                >
                  {editingTransaction ? 'Save Changes' : 'Record Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTransactionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-navy-900 border border-navy-700 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Confirm Deletion</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete this transaction? All dependent metrics, available balance, and forecasts will immediately recalculate.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingTransactionId(null)}
                className="px-4 py-2 bg-navy-800 hover:bg-navy-750 text-slate-300 rounded-lg text-xs"
              >
                Keep
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-brand-coral hover:bg-rose-600 text-white font-bold rounded-lg text-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
