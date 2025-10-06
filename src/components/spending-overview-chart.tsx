"use client"

import * as React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Category } from "@/lib/definitions";

interface SpendingOverviewChartProps {
  data: any[];
  categories: Category[];
}

export function SpendingOverviewChart({ data, categories }: SpendingOverviewChartProps) {
  const [activeCategories, setActiveCategories] = React.useState<Record<string, boolean>>(
    categories.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {})
  );

  const handleLegendClick = (dataKey: string) => {
    setActiveCategories(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };
  
  const categoryMap = React.useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  const categoriesWithSpending = React.useMemo(() => {
    return categories.filter(category => 
      data.some(d => d[category.id] > 0)
    );
  }, [data, categories]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Overview</CardTitle>
        <CardDescription>
          Your daily spending trends for the current month.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          {data.length > 0 ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `Tk ${value}`}
              />
               <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-1 gap-2">
                           <p className="text-sm font-bold text-foreground">{label}</p>
                           <div className="grid grid-cols-1 gap-1.5">
                            {payload.map((item) => {
                              const category = categoryMap.get(item.dataKey as string);
                              if (item.value === 0) return null;
                              return(
                              <div key={item.dataKey} className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{backgroundColor: item.color}}/>
                                <span className="text-xs text-muted-foreground">{category?.name}</span>
                                <span className="ml-auto text-xs font-semibold text-foreground">Tk {item.value}</span>
                              </div>
                            )}
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend onClick={(e) => { if (e.dataKey) { handleLegendClick(e.dataKey.toString()); } }} />
              {categoriesWithSpending.map((category) => (
                <Line
                  key={category.id}
                  type="monotone"
                  dataKey={category.id}
                  name={category.name}
                  stroke={category.color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  hide={!activeCategories[category.id]}
                />
              ))}
            </LineChart>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-muted-foreground">No spending data for this month yet.</p>
            </div>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
