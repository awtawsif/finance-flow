"use client"

import * as React from "react"
import {
  Bar,
  BarChart as BarChartPrimitive,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Legend as LegendPrimitive,
  Pie,
  PieChart as PieChartPrimitive,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RadarChartPrimitive,
  RadialBar,
  RadialBarChart as RadialBarChartPrimitive,
  Rectangle,
  ResponsiveContainer,
  Scatter,
  ScatterChart as ScatterChartPrimitive,
  Tooltip as TooltipPrimitive,
  XAxis,
  YAxis,
} from "recharts"
import {
  type BarChartProps,
  type ChartProps,
  type LegendProps,
  type PieChartProps,
  type RadarChartProps,
  type RadialChartProps,
  type ScatterChartProps,
  type TooltipProps,
} from "recharts"
import type {
  AxisDomain,
  AxisScale,
  BaseAxisProps,
  ChartLayoutType,
  ChartOffset,
  LegendType,
  PieLabel,
  StackOffsetType,
  TickFormatter,
  TooltipFormatter,
} from "recharts/types/component/DefaultProps"
import type {
  AnimationTiming,
  CategoricalChartFunc,
  ChartCoordinate,
  Margin,
  Payload as RechartsPayload,
} from "recharts/types/util/types"

import { cn } from "@/lib/utils"
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartTooltipFrame,
  ChartTooltipTrigger,
} from "@/components/ui/tooltip"

// #region Chart Types

type ChartContextProps = {
  config: {
    [key in string]: {
      label?: React.ReactNode
      color?: string
    } & {
      [key: string]: unknown
    }
  }
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

// #endregion

// #region ChartContainer

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartContextProps["config"]
    children: React.ComponentProps<
      typeof ResponsiveContainer
    >["children"] &
      React.ReactNode
  } & Omit<ChartProps, "children">
>(({ config, className, children, ...props }, ref) => {
  const chartConfig = React.useMemo(() => {
    return {
      config,
    }
  }, [config])

  return (
    <ChartContext.Provider value={chartConfig}>
      <div ref={ref} className={cn("h-full w-full", className)} {...props}>
        <ResponsiveContainer>
          <>{children}</>
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

// #endregion

// #region ChartLegend

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof LegendPrimitive>,
  React.ComponentProps<typeof LegendPrimitive> & {
    hide?: boolean
  }
>(({ className, hide, ...props }, ref) => {
  const { config } = useChart()

  if (hide) {
    return null
  }

  return (
    <LegendPrimitive
      ref={ref}
      verticalAlign="top"
      content={({ payload }) => {
        return (
          <div className="flex items-center justify-center gap-4">
            {payload?.map((item) => {
              const { dataKey, color } = item
              const key = dataKey as string

              if (!key || typeof key !== "string" || !config[key]) {

                return null
              }
              const itemConfig = config[key]

              return (
                <div
                  key={item.value}
                  className="flex items-center gap-1.5 [&>svg]:size-3 [&>svg]:text-muted-foreground"
                >
                  <div
                    className="size-2 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor: color,
                    }}
                  />
                  {itemConfig?.label}
                </div>
              )
            })}
          </div>
        )
      }}
      {...props}
    />
  )
})
ChartLegend.displayName = "ChartLegend"

// #endregion

// #region ChartTooltip

const ChartTooltipContentWrapper = React.forwardRef<
  React.ElementRef<typeof ChartTooltipContent>,
  Omit<
    React.ComponentProps<typeof TooltipPrimitive>,
    "content" | "wrapperStyle"
  > & {
    indicator?: "line" | "dot" | "dashed"
    hideLabel?: boolean
    hideIndicator?: boolean
    labelKey?: string
    nameKey?: string
  }
>(
  (
    {
      active,
      payload,
      label,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      labelKey,
      formatter,
      nameKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      if (labelKey && payload?.[0] && typeof payload[0].payload === "object") {
        return payload[0].payload[labelKey]
      }

      if (label) {
        return label
      }

      return null
    }, [label, payload, hideLabel, labelKey])

    if (!active || !payload || !payload.length) {
      return null
    }

    return (
      <ChartTooltipContent
        ref={ref}
        className={cn("w-auto min-w-[8rem] ", className)}
      >
        {tooltipLabel ? (
          <div className="border-b px-3 py-1.5">{tooltipLabel}</div>
        ) : null}
        <div className="grid gap-1.5 px-3 py-1.5">
          {payload.map((item, index) => {
            const { name, value, color } = item
            const key = nameKey ? item.payload[nameKey] : name

            if (!key || typeof key !== "string" || !config[key]) {
              return null
            }
            const itemConfig = config[key]

            const indicatorColor = color

            return (
              <div
                key={item.dataKey}
                className="grid grid-cols-[auto,1fr,auto] items-center gap-x-2"
              >
                {!hideIndicator ? (
                  <div
                    className={cn("size-2 shrink-0 rounded-[2px]", {
                      "border border-dashed": indicator === "dashed",
                    })}
                    style={{
                      background: indicatorColor,
                    }}
                  />
                ) : null}

                <div className="flex-1 truncate text-xs">{itemConfig.label}</div>
                {formatter ? (
                  <div className="text-right text-xs font-medium tabular-nums">
                    {formatter(value, name, item, index, payload)}
                  </div>
                ) : (
                  <div className="text-right text-xs font-medium tabular-nums">
                    {value}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ChartTooltipContent>
    )
  }
)
ChartTooltipContentWrapper.displayName = "ChartTooltipContentWrapper"

// #endregion

export {
  // Chart
  ChartContainer,
  // Bar Chart
  BarChartPrimitive as BarChart,
  // Pie Chart
  PieChartPrimitive as PieChart,
  // Radar Chart
  RadarChartPrimitive as RadarChart,
  // Radial Chart
  RadialBarChartPrimitive as RadialChart,
  // Scatter Chart
  ScatterChartPrimitive as ScatterChart,
  // Components
  Bar,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  LegendPrimitive as Legend,
  Pie,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadialBar,
  Rectangle,
  ResponsiveContainer,
  Scatter,
  TooltipPrimitive as Tooltip,
  XAxis,
  YAxis,
  // Custom Components
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  ChartTooltipContentWrapper,
  ChartTooltipFrame,
  ChartTooltipTrigger,
  // Types
  type AnimationTiming,
  type AxisDomain,
  type AxisScale,
  type BarChartProps,
  type BaseAxisProps,
  type CategoricalChartFunc,
  type ChartCoordinate,
  type ChartLayoutType,
  type ChartOffset,
  type ChartProps,
  type LegendProps,
  type LegendType,
  type Margin,
  type PieChartProps,
  type PieLabel,
  type RadarChartProps,
  type RadialChartProps,
  type RechartsPayload,
  type ScatterChartProps,
  type StackOffsetType,
  type TickFormatter,
  type TooltipFormatter,
  type TooltipProps,
}
