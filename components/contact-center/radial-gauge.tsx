"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface RadialGaugeProps {
  value: number
  max: number
  label: string
  unit?: string
  size?: "sm" | "md" | "lg"
  colorScheme?: "success" | "warning" | "danger" | "info" | "neutral"
  showTrend?: boolean
  trend?: number
  animate?: boolean
}

const sizeConfig = {
  sm: { width: 100, strokeWidth: 8, fontSize: "text-lg", labelSize: "text-xs" },
  md: { width: 140, strokeWidth: 10, fontSize: "text-2xl", labelSize: "text-sm" },
  lg: { width: 180, strokeWidth: 12, fontSize: "text-3xl", labelSize: "text-base" },
}

const colorConfig = {
  success: { stroke: "#10b981", bg: "#10b98120" },
  warning: { stroke: "#f59e0b", bg: "#f59e0b20" },
  danger: { stroke: "#ef4444", bg: "#ef444420" },
  info: { stroke: "#3b82f6", bg: "#3b82f620" },
  neutral: { stroke: "#6b7280", bg: "#6b728020" },
}

export function RadialGauge({
  value,
  max,
  label,
  unit = "%",
  size = "md",
  colorScheme = "info",
  showTrend = false,
  trend = 0,
  animate = true,
}: RadialGaugeProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value)
  const config = sizeConfig[size]
  const colors = colorConfig[colorScheme]
  
  const radius = (config.width - config.strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min((displayValue / max) * 100, 100)
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value)
      return
    }

    const duration = 1000
    const steps = 60
    const stepValue = (value - displayValue) / steps
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      if (currentStep >= steps) {
        setDisplayValue(value)
        clearInterval(interval)
      } else {
        setDisplayValue((prev) => prev + stepValue)
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [value, animate])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg className="transform -rotate-90" width={config.width} height={config.width}>
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke={colors.bg}
            strokeWidth={config.strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold tabular-nums", config.fontSize)}>
            {Math.round(displayValue)}
            <span className="text-muted-foreground text-sm">{unit}</span>
          </span>
          {showTrend && (
            <span
              className={cn(
                "text-xs font-medium",
                trend > 0 ? "text-emerald-500" : trend < 0 ? "text-red-500" : "text-muted-foreground"
              )}
            >
              {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
      <span className={cn("font-medium text-muted-foreground text-center", config.labelSize)}>
        {label}
      </span>
    </div>
  )
}
