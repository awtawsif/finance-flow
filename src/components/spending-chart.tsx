'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { Expense } from '@/lib/definitions';
import { categoryMap } from '@/lib/data';

interface SpendingChartProps {
  expenses: Expense[];
}

export function SpendingChart({ expenses }: SpendingChartProps) {
  const chartData = React.useMemo(() => {
    const spendingByCategory = expenses.reduce<Record<string, { total: number; fill: string }>>((acc, expense) => {
      const category = categoryMap.get(expense.categoryId);
      if (category) {
        if (!acc[category.name]) {
          acc[category.name] = { total: 0, fill: category.color };
        }
        acc[category.name].total += expense.amount;
      }
      return acc;
    }, {});
    
    return Object.entries(spendingByCategory).map(([name, data]) => ({
      name,
      total: data.total,
      fill: data.fill,
    })).sort((a, b) => b.total - a.total);
  }, [expenses]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>A look at where your money is going this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-64 w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--background))' }}
              content={<ChartTooltipContent 
                formatter={(value) => `$${Number(value).toFixed(2)}`}
                nameKey="name" 
                labelKey="total"
              />}
            />
            <Bar dataKey="total" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
