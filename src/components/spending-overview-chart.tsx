
"use client"

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { useDataContext } from '@/context/data-context';
import { ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';


type TimeRange = 'week' | 'month' | 'all';

export function SpendingOverviewChart() {
  const { expenses, categories } = useDataContext();
  const [timeRange, setTimeRange] = React.useState<TimeRange>('month');
  const [showAll, setShowAll] = React.useState(false);
  const isMobile = useIsMobile();

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
            };
        }
        acc[category.id].value += expense.amount;
      }
      return acc;
    }, {} as Record<string, { name: string; value: number; color: string }>);

    return Object.values(spendingByCategory).sort((a, b) => b.value - a.value);
  }, [filteredExpenses, categoryMap]);
  
  const timeRangeLabels: Record<TimeRange, string> = {
    week: 'this week',
    month: 'this month',
    all: 'all time',
  };

  const visibleData = isMobile && !showAll ? spendingData.slice(0, 4) : spendingData;

  const CustomLegend = (props: any) => {
    const { payload } = props;

    return (
        <div className="flex flex-col items-center mt-4">
            <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                {payload.map((entry: any, index: number) => (
                    <li key={`item-${index}`} className="flex items-center text-sm">
                        <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                        <span>{entry.value}</span>
                    </li>
                ))}
            </ul>
            {isMobile && spendingData.length > 4 && (
                <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? 'Show Less' : `+${spendingData.length - 4} more`}
                    <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                </Button>
            )}
        </div>
    );
};

  return (
    <Card>
      <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Visual Breakdown</CardTitle>
          <CardDescription>
            Visual breakdown of your expenses for {timeRangeLabels[timeRange]}.
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
                    <Tooltip
                        contentStyle={{
                            background: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number) => [`Tk ${value.toFixed(2)}`, 'Spent']}
                    />
                    <Pie
                        data={visibleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={'80%'}
                        innerRadius={'60%'}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        stroke="hsl(var(--background))"
                        strokeWidth={4}
                    >
                        {visibleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Legend content={<CustomLegend />} />
                </PieChart>
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <p className="text-muted-foreground">No spending data for this period.</p>
                </div>
            )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
