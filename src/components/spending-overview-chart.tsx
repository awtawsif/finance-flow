
"use client"

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
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
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';


type TimeRange = 'week' | 'month' | 'all';
type ChartView = 'by_category' | 'by_item';

export function SpendingOverviewChart() {
  const { expenses, categories } = useDataContext();
  const [timeRange, setTimeRange] = React.useState<TimeRange>('month');
  const [showAll, setShowAll] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<{id: string, name: string} | null>(null);
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

  const spendingByCategory = React.useMemo(() => {
    if (filteredExpenses.length === 0) return [];

    const spendingMap = filteredExpenses.reduce((acc, expense) => {
      const category = categoryMap.get(expense.categoryId);
      if (category) {
        if (!acc[category.id]) {
            acc[category.id] = {
                id: category.id,
                name: category.name,
                value: 0,
                color: category.color,
            };
        }
        acc[category.id].value += expense.amount;
      }
      return acc;
    }, {} as Record<string, { id: string; name: string; value: number; color: string }>);

    return Object.values(spendingMap).sort((a, b) => b.value - a.value);
  }, [filteredExpenses, categoryMap]);
  
  const spendingByItem = React.useMemo(() => {
    if (!selectedCategory) return [];
    
    const itemsInCategory = filteredExpenses.filter(e => e.categoryId === selectedCategory.id);
    
    const spendingMap = itemsInCategory.reduce((acc, expense) => {
      // Normalize description for better grouping
      const itemName = expense.description.trim().toLowerCase();
      if (!acc[itemName]) {
        acc[itemName] = { name: expense.description, value: 0 };
      }
      acc[itemName].value += expense.amount;
      return acc;
    }, {} as Record<string, { name: string; value: number }>);

    return Object.values(spendingMap).sort((a, b) => a.value - b.value).slice(-10); // show top 10
  }, [filteredExpenses, selectedCategory]);

  const timeRangeLabels: Record<TimeRange, string> = {
    week: 'this week',
    month: 'this month',
    all: 'all time',
  };

  const handlePieClick = (data: any) => {
    setSelectedCategory({ id: data.id, name: data.name });
  };
  
  const handleBackClick = () => {
    setSelectedCategory(null);
  };

  const visibleData = isMobile && !showAll ? spendingByCategory.slice(0, 4) : spendingByCategory;

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
            {isMobile && spendingByCategory.length > 4 && (
                <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? 'Show Less' : `+${spendingByCategory.length - 4} more`}
                    <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                </Button>
            )}
        </div>
    );
};

  const chartTitle = selectedCategory 
    ? `Top Spending in "${selectedCategory.name}"`
    : 'Visual Breakdown';
  
  const chartDescription = `Breakdown of your expenses for ${timeRangeLabels[timeRange]}.`;

  return (
    <Card>
      <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
           {selectedCategory && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBackClick}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          <div>
            <CardTitle>{chartTitle}</CardTitle>
            <CardDescription>{chartDescription}</CardDescription>
          </div>
        </div>
         <div className="flex items-center gap-2">
          {(['week', 'month', 'all'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="capitalize"
              disabled={!!selectedCategory}
            >
              {range}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {selectedCategory ? (
           <ResponsiveContainer width="100%" height={300}>
              {spendingByItem.length > 0 ? (
                <BarChart data={spendingByItem} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                    tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                  />
                  <Tooltip
                      contentStyle={{
                          background: "hsl(var(--background))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "var(--radius)",
                      }}
                      formatter={(value: number) => [`Tk ${value.toFixed(2)}`, 'Spent']}
                      cursor={{fill: 'hsl(var(--accent))', radius: 'var(--radius)'}}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                     {spendingByItem.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <p className="text-muted-foreground">No spending data for this category in this period.</p>
                </div>
              )}
           </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
              {spendingByCategory.length > 0 ? (
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
                          onClick={handlePieClick}
                      >
                          {visibleData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} style={{cursor: 'pointer'}} />
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
        )}
      </CardContent>
    </Card>
  )
}
