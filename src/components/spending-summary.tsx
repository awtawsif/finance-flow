
'use client';

import * as React from 'react';
import { isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDataContext } from '@/context/data-context';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type TimeRange = 'week' | 'month' | 'all';

export function SpendingSummary() {
  const { expenses, categories } = useDataContext();
  const [timeRange, setTimeRange] = React.useState<TimeRange>('month');

  const categoryMap = React.useMemo(
    () => new Map(categories.map((cat) => [cat.id, cat])),
    [categories]
  );

  const filteredExpenses = React.useMemo(() => {
    if (expenses.length === 0) return [];
    const now = new Date();
    let interval: Interval;

    switch (timeRange) {
      case 'week':
        interval = { start: startOfWeek(now), end: endOfWeek(now) };
        break;
      case 'month':
        interval = { start: startOfMonth(now), end: endOfMonth(now) };
        break;
      case 'all':
      default:
        return expenses;
    }
    return expenses.filter(expense => isWithinInterval(expense.date, interval));
  }, [expenses, timeRange]);

  const spendingData = React.useMemo(() => {
    if (filteredExpenses.length === 0) return [];

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
    }, {} as Record<string, { name: string; value: number; color: string, icon: React.ElementType }>);

    return Object.values(spendingByCategory).sort((a, b) => b.value - a.value);
  }, [filteredExpenses, categories, categoryMap]);

  const totalSpending = React.useMemo(
    () => spendingData.reduce((sum, item) => sum + item.value, 0),
    [spendingData]
  );

  const timeRangeLabels: Record<TimeRange, string> = {
    week: 'this week',
    month: 'this month',
    all: 'all time',
  };

  return (
    <Card>
      <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Spending Breakdown</CardTitle>
          <CardDescription>
            Numerical breakdown of your expenses for {timeRangeLabels[timeRange]}.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {(['week', 'month', 'all'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {spendingData.length > 0 ? (
          <div className="space-y-4">
            {spendingData.map((item) => (
              <div key={item.name} className="flex items-center">
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" style={{color: item.color}} />
                <span className="flex-1 truncate font-medium">{item.name}</span>
                <span className="font-mono font-semibold">Tk {item.value.toFixed(2)}</span>
              </div>
            ))}
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
