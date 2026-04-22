"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface LiveMetricCardProps {
  title: string
  value: number
  unit?: string
  target?: number
  trend?: number
  icon?: React.ReactNode
  status?: "good" | "warning" | "critical" | "neutral"
  sparkline?: number[]
  format?: "number" | "time" | "percentage"
}

const statusColors = {
  good: "text-emerald-500",
  warning: "text-amber-500",
  critical: "text-red-500",
  neutral: "text-muted-foreground",
}

const statusBg = {
  good: "bg-emerald-500/10",
  warning: "bg-amber-500/10",
  critical: "bg-red-500/10",
  neutral: "bg-muted",
}

function formatValue(value: number, format: "number" | "time" | "percentage"): string {
  switch (format) {
    case "time":
      const minutes = Math.floor(value)
      const seconds = Math.round((value - minutes) * 60)
      return `${minutes}:${seconds.toString().padStart(2, "0")}`
    case "percentage":
      return `${value.toFixed(1)}%`
    default:
      return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0)
  }
}

function MiniSparkline({ data, status }: { data: number[]; status: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const height = 30
  const width = 80
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((val - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={status === "critical" ? "#ef4444" : status === "warning" ? "#f59e0b" : "#10b981"}
        strokeWidth="2"
        points={points}
        className="opacity-70"
      />
    </svg>
  )
}

export function LiveMetricCard({
  title,
  value,
  unit,
  target,
  trend,
  icon,
  status = "neutral",
  sparkline,
  format = "number",
}: LiveMetricCardProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timeout = setTimeout(() => setIsAnimating(false), 300)
    setDisplayValue(value)
    return () => clearTimeout(timeout)
  }, [value])

  const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus

  return (
    <Card className={cn("relative overflow-hidden transition-all", isAnimating && "ring-1 ring-primary/20")}>
      <div className={cn("absolute top-0 left-0 w-1 h-full", statusBg[status])} />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-1.5 rounded-md", statusBg[status])}>
          {icon || <Activity className={cn("w-4 h-4", statusColors[status])} />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className={cn("text-2xl font-bold tabular-nums", statusColors[status])}>
                {formatValue(displayValue, format)}
              </span>
              {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            </div>
            {target && (
              <p className="text-xs text-muted-foreground mt-1">
                Target: {formatValue(target, format)}
              </p>
            )}
            {trend !== undefined && (
              <div className={cn("flex items-center gap-1 mt-1 text-xs font-medium", 
                trend > 0 ? "text-emerald-500" : trend < 0 ? "text-red-500" : "text-muted-foreground"
              )}>
                <TrendIcon className="w-3 h-3" />
                <span>{Math.abs(trend)}% vs last hour</span>
              </div>
            )}
          </div>
          {sparkline && <MiniSparkline data={sparkline} status={status} />}
        </div>
      </CardContent>
    </Card>
  )
}
