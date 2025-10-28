'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { useDataContext } from '@/context/data-context';
import { Separator } from '@/components/ui/separator';
import { getIcon } from '@/lib/icons';
import { DateFilterControls, useDateFilter } from './date-filter-controls';

export function SpendingSummary() {
  const { categories } = useDataContext();
  const { filteredExpenses } = useDateFilter();

  const categoryMap = React.useMemo(
    () => new Map(categories.map((cat) => [cat.id, cat])),
    [categories]
  );

  const spendingData = React.useMemo(() => {
    if (!filteredExpenses || filteredExpenses.length === 0) return [];

    const spendingByCategory = filteredExpenses.reduce((acc, expense) => {
      const category = categoryMap.get(expense.categoryId);
      if (category) {
        if (!acc[category.id]) {
            acc[category.id] = {
                name: category.name,
                value: 0,
                color: category.color,
                icon: category.icon,
            };
        }
        acc[category.id].value += expense.amount;
      }
      return acc;
    }, {} as Record<string, { name: string; value: number; color: string, icon: string }>);

    return Object.values(spendingByCategory).sort((a, b) => b.value - a.value);
  }, [filteredExpenses, categoryMap]);

  const totalSpending = React.useMemo(
    () => spendingData.reduce((sum, item) => sum + item.value, 0),
    [spendingData]
  );

  return (
    <Card>
      <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Spending Breakdown</CardTitle>
          <CardDescription>
            Numerical breakdown of your expenses.
          </CardDescription>
        </div>
        <DateFilterControls />
      </CardHeader>
      <CardContent>
        {spendingData.length > 0 ? (
          <div className="space-y-4">
            {spendingData.map((item) => {
                const Icon = getIcon(item.icon);
                return (
                  <div key={item.name} className="flex items-center">
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" style={{color: item.color}} />
                    <span className="flex-1 truncate font-medium">{item.name}</span>
                    <span className="font-mono font-semibold">Tk {item.value.toFixed(2)}</span>
                  </div>
                );
            })}
          </div>
        ) : (
          <div className="flex h-[150px] items-center justify-center">
            <p className="text-muted-foreground">No spending data for this period.</p>
          </div>
        )}
      </CardContent>
      {spendingData.length > 0 && (
        <CardFooter className="flex-col items-start gap-2 pt-4">
            <Separator />
            <div className="flex w-full items-center justify-between pt-2">
                <span className="text-lg font-bold">Overall Spending</span>
                <span className="text-lg font-bold font-mono">Tk {totalSpending.toFixed(2)}</span>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
