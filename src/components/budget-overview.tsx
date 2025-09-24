'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Expense, Budget } from '@/lib/definitions';
import { categoryMap } from '@/lib/data';

interface BudgetOverviewProps {
  expenses: Expense[];
  budgets: Budget[];
}

export function BudgetOverview({ expenses, budgets }: BudgetOverviewProps) {
  const budgetData = React.useMemo(() => {
    return budgets.map((budget) => {
      const category = categoryMap.get(budget.categoryId);
      if (!category) return null;

      const spent = expenses
        .filter((exp) => exp.categoryId === budget.categoryId)
        .reduce((sum, exp) => sum + exp.amount, 0);

      const progress = (spent / budget.limit) * 100;

      return {
        ...category,
        spent,
        limit: budget.limit,
        progress: Math.min(progress, 100), // Cap progress at 100%
        overBudget: progress > 100
      };
    }).filter(Boolean);
  }, [expenses, budgets]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
        <CardDescription>Your spending progress against monthly budgets.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {budgetData.length > 0 ? budgetData.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center font-medium">
                <item.icon className="mr-2 h-4 w-4" style={{ color: item.color }} />
                <span>{item.name}</span>
              </div>
              <span className={item.overBudget ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                ${item.spent.toFixed(2)} / ${item.limit.toFixed(2)}
              </span>
            </div>
            <Progress value={item.progress} />
          </div>
        )) : <p className="text-sm text-muted-foreground">No budgets set for this month.</p>}
      </CardContent>
    </Card>
  );
}
