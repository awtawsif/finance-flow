'use client';

import * as React from 'react';
import { initialExpenses, initialBudgets, spendingSummary as summaryData } from '@/lib/data';
import type { Expense, Budget } from '@/lib/definitions';
import { SummaryCard } from '@/components/summary-card';
import { AddExpense } from '@/components/add-expense';
import { BudgetOverview } from '@/components/budget-overview';
import { RecentExpenses } from '@/components/recent-expenses';
import { SpendingSummary } from '@/components/spending-summary';

export default function Dashboard() {
  const [expenses, setExpenses] = React.useState<Expense[]>(initialExpenses);
  const [budgets, setBudgets] = React.useState<Budget[]>(initialBudgets);

  const handleAddExpense = React.useCallback((newExpenseData: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...newExpenseData,
      id: `exp-${Date.now()}`,
      date: new Date(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
  }, []);
  
  const handleSetBudget = React.useCallback((newBudgetData: Budget) => {
    setBudgets((prev) => {
      const existingBudgetIndex = prev.findIndex(b => b.categoryId === newBudgetData.categoryId);
      if (existingBudgetIndex > -1) {
        const updatedBudgets = [...prev];
        updatedBudgets[existingBudgetIndex] = newBudgetData;
        return updatedBudgets;
      }
      return [...prev, newBudgetData];
    });
  }, []);

  const { totalSpending, totalBudget } = React.useMemo(() => {
    const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalBudget = budgets.reduce((sum, bud) => sum + bud.limit, 0);
    return { totalSpending, totalBudget };
  }, [expenses, budgets]);

  const remainingBudget = totalBudget - totalSpending;
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome Back!
        </h1>
        <AddExpense onAddExpense={handleAddExpense} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard 
          title="Total Spending (This Month)" 
          value={`$${totalSpending.toFixed(2)}`}
          description="Your total expenditure for the current month." 
        />
        <SummaryCard 
          title="Total Budget (This Month)" 
          value={`$${totalBudget.toFixed(2)}`}
          description="Your total allocated budget for the month."
        />
        <SummaryCard 
          title="Remaining Budget" 
          value={`$${remainingBudget.toFixed(2)}`}
          description={remainingBudget >= 0 ? "You are within budget." : "You are over budget."}
          isPositive={remainingBudget >= 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="flex flex-col gap-8 lg:col-span-3">
            <RecentExpenses expenses={expenses} />
        </div>
        <div className="flex flex-col gap-8 lg:col-span-2">
            <SpendingSummary title={summaryData.title} analysis={summaryData.analysis} />
            <BudgetOverview expenses={expenses} budgets={budgets} onSetBudget={handleSetBudget} />
        </div>
      </div>
    </div>
  );
}
