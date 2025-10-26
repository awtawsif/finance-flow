
"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts"
import { isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { useDataContext } from "@/context/data-context"

type TimeRange = 'week' | 'month' | 'all';

export function SpendingSummary() {
  const { expenses, categories } = useDataContext();
  const [timeRange, setTimeRange] = React.useState<TimeRange>('month');

  const categoryMap = React.useMemo(() => 
    new Map(categories.map(cat => [cat.id, cat]))
  , [categories]);

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
        acc[category.name] = (acc[category.name] || 0) + expense.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(spendingByCategory).map(([name, value]) => {
      const category = categories.find(c => c.name === name);
      return {
        name,
        value,
        fill: category ? category.color : '#8884d8',
      };
    }).sort((a, b) => b.value - a.value); // Sort for consistent color assignment
  }, [filteredExpenses, categories, categoryMap]);
  
  const totalSpending = React.useMemo(() => 
    spendingData.reduce((sum, item) => sum + item.value, 0)
  , [spendingData]);

  const timeRangeLabels: Record<TimeRange, string> = {
    week: 'this week',
    month: 'this month',
    all: 'all time'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Spending Summary</CardTitle>
          <CardDescription>
            A breakdown of your expenses by category for {timeRangeLabels[timeRange]}.
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
        <ResponsiveContainer width="100%" height={250}>
          {spendingData.length > 0 ? (
            <PieChart>
              <Pie
                data={spendingData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {spendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-1 gap-1.5">
                          <p className="text-sm font-bold text-foreground">{data.name}</p>
                          <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full" style={{backgroundColor: data.payload.fill}}/>
                            <span className="text-xs text-muted-foreground">
                              Tk {Number(data.value).toFixed(2)}
                            </span>
                            <span className="ml-auto text-xs font-semibold text-foreground">
                              {((Number(data.value) / totalSpending) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{ right: -10, top: 20, lineHeight: '24px' }}
                formatter={(value, entry) => {
                  const { color } = entry;
                  const dataEntry = spendingData.find(d => d.name === value);
                  const percentage = dataEntry ? ((dataEntry.value / totalSpending) * 100).toFixed(0) : 0;
                  return <span className="text-sm" style={{ color: color }}><span className="font-bold">{value}</span> ({percentage}%)</span>;
                }}
              />
            </PieChart>
          ) : (
            <div className="flex h-[250px] w-full items-center justify-center">
              <p className="text-muted-foreground">No spending data for this period.</p>
            </div>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
