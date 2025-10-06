"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SpendingOverviewChartProps {
  data: {
    name: string
    total: number
    fill: string
  }[]
}

export function SpendingOverviewChart({ data }: SpendingOverviewChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Overview</CardTitle>
        <CardDescription>
          A visual breakdown of your spending by category this month.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          {data.length > 0 ? (
            <BarChart data={data}>
              <XAxis
                dataKey="name"
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
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col space-y-1">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {payload[0].payload.name}
                            </span>
                            <span className="font-bold text-muted-foreground">
                              Tk {payload[0].value}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} />
            </BarChart>
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
