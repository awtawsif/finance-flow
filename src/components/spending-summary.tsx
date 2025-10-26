
"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useDataContext } from "@/context/data-context"
import { cn } from "@/lib/utils"

export function SpendingSummary() {
  const { expenses, categories } = useDataContext();

  const categoryMap = React.useMemo(() => 
    new Map(categories.map(cat => [cat.id, cat]))
  , [categories]);

  const spendingData = React.useMemo(() => {
    if (expenses.length === 0) return [];

    const spendingByCategory = expenses.reduce((acc, expense) => {
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
  }, [expenses, categories, categoryMap]);
  
  const totalSpending = React.useMemo(() => 
    spendingData.reduce((sum, item) => sum + item.value, 0)
  , [spendingData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Summary</CardTitle>
        <CardDescription>
          A breakdown of your expenses by category for this month.
        </CardDescription>
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
              <p className="text-muted-foreground">No spending data to display.</p>
            </div>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
