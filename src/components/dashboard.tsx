'use client';

import * as React from 'react';
import { initialCategories } from '@/lib/data';
import type { Expense, Category } from '@/lib/definitions';
import { SummaryCard } from '@/components/summary-card';
import { AddExpense } from '@/components/add-expense';
import { RecentExpenses } from '@/components/recent-expenses';
import { AddCategory } from '@/components/add-category';
import { Shapes } from 'lucide-react';
import { SetOverallBudget } from '@/components/set-overall-budget';

export default function Dashboard() {
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [categories, setCategories] = React.useState<Category[]>(initialCategories);
  const [overallBudget, setOverallBudget] = React.useState<number>(0);
  const [categoryMap, setCategoryMap] = React.useState(() => new Map(initialCategories.map(cat => [cat.id, cat])));

  React.useEffect(() => {
    setCategoryMap(new Map(categories.map(cat => [cat.id, cat])));
  }, [categories]);

  const handleAddExpense = React.useCallback((newExpenseData: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...newExpenseData,
      id: `exp-${Date.now()}`,
      date: new Date(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
  }, []);
  
  const handleSetOverallBudget = React.useCallback((newBudget: number) => {
    setOverallBudget(newBudget);
  }, []);

  const handleAddCategory = React.useCallback((categoryName: string) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: categoryName,
      icon: Shapes,
      // Generate a random HSL color
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    };
    setCategories((prev) => [...prev, newCategory]);
  }, []);


  const { totalSpending, totalBudget } = React.useMemo(() => {
    const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return { totalSpending, totalBudget: overallBudget };
  }, [expenses, overallBudget]);

  const remainingBudget = totalBudget - totalSpending;
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome Back!
        </h1>
        <div className="flex gap-2">
          <SetOverallBudget onSetBudget={handleSetOverallBudget} currentBudget={overallBudget} />
          <AddCategory onAddCategory={handleAddCategory} />
          <AddExpense onAddExpense={handleAddExpense} categories={categories} />
        </div>
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

      <div className="grid grid-cols-1">
        <RecentExpenses expenses={expenses} categoryMap={categoryMap} />
      </div>
    </div>
  );
}
