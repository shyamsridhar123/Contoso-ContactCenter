"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

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
  sublabel?: string
}

const sizeConfig = {
  sm: { width: 108, strokeWidth: 8, fontSize: "text-xl", labelSize: "text-[10px]" },
  md: { width: 148, strokeWidth: 10, fontSize: "text-[28px]", labelSize: "text-xs" },
  lg: { width: 188, strokeWidth: 12, fontSize: "text-4xl", labelSize: "text-sm" },
}

const colorConfig = {
  success: {
    from: "oklch(0.78 0.17 165)",
    to: "oklch(0.72 0.18 195)",
    glow: "oklch(0.78 0.17 165 / 0.45)",
    text: "text-emerald-300",
  },
  warning: {
    from: "oklch(0.82 0.17 85)",
    to: "oklch(0.75 0.19 55)",
    glow: "oklch(0.8 0.18 75 / 0.45)",
    text: "text-amber-300",
  },
  danger: {
    from: "oklch(0.72 0.22 25)",
    to: "oklch(0.65 0.24 5)",
    glow: "oklch(0.68 0.22 15 / 0.5)",
    text: "text-rose-300",
  },
  info: {
    from: "oklch(0.8 0.14 210)",
    to: "oklch(0.75 0.17 240)",
    glow: "oklch(0.78 0.15 220 / 0.45)",
    text: "text-sky-300",
  },
  neutral: {
    from: "oklch(0.8 0.02 240)",
    to: "oklch(0.6 0.02 240)",
    glow: "oklch(0.7 0.02 240 / 0.3)",
    text: "text-slate-200",
  },
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
  sublabel,
}: RadialGaugeProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value)
  const config = sizeConfig[size]
  const colors = colorConfig[colorScheme]
  const gradientId = useRef(`gauge-${Math.random().toString(36).slice(2, 9)}`).current

  const radius = (config.width - config.strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min((displayValue / max) * 100, 100)
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value)
      return
    }
    const duration = 900
    const steps = 48
    const start = displayValue
    const delta = value - start
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      // ease-out-cubic
      const t = currentStep / steps
      const eased = 1 - Math.pow(1 - t, 3)
      if (currentStep >= steps) {
        setDisplayValue(value)
        clearInterval(interval)
      } else {
        setDisplayValue(start + delta * eased)
      }
    }, duration / steps)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, animate])

  const TrendIcon = trend > 0 ? ArrowUp : trend < 0 ? ArrowDown : Minus
  const trendColor =
    trend > 0 ? "text-emerald-300" : trend < 0 ? "text-rose-300" : "text-slate-400"

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div
        className="relative grid place-items-center"
        style={{ width: config.width, height: config.width }}
      >
        {/* Outer radial glow */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full blur-2xl opacity-70 transition-opacity"
          style={{
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 65%)`,
          }}
        />

        <svg
          className="relative -rotate-90 drop-shadow-[0_4px_12px_oklch(0_0_0/0.25)]"
          width={config.width}
          height={config.width}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
            <filter id={`${gradientId}-glow`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="oklch(1 0 0 / 0.06)"
            strokeWidth={config.strokeWidth}
          />

          {/* Subtle inner track dashes for tick feel */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius - config.strokeWidth / 2 - 6}
            fill="none"
            stroke="oklch(1 0 0 / 0.04)"
            strokeWidth="1"
            strokeDasharray="2 6"
          />

          {/* Progress ring */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter={`url(#${gradientId}-glow)`}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>

        {/* Glass center disc */}
        <div
          className="absolute rounded-full glass-subtle flex flex-col items-center justify-center"
          style={{
            width: config.width - config.strokeWidth * 2 - 12,
            height: config.width - config.strokeWidth * 2 - 12,
          }}
        >
          <span
            className={cn(
              "font-bold tabular-nums leading-none tracking-tight",
              config.fontSize,
              colors.text,
            )}
            style={{
              textShadow: `0 0 24px ${colors.glow}`,
            }}
          >
            {Math.round(displayValue)}
            <span className="text-[0.5em] font-medium text-muted-foreground ml-0.5">
              {unit}
            </span>
          </span>
          {showTrend && (
            <span
              className={cn(
                "mt-1 flex items-center gap-0.5 text-[10px] font-semibold tabular-nums",
                trendColor,
              )}
            >
              <TrendIcon className="w-2.5 h-2.5" strokeWidth={3} />
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {sublabel && !showTrend && (
            <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">
              {sublabel}
            </span>
          )}
        </div>
      </div>
      <div className="text-center">
        <p
          className={cn(
            "font-medium text-foreground/80 uppercase tracking-wider",
            config.labelSize,
          )}
        >
          {label}
        </p>
      </div>
    </div>
  )
}
