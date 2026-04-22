"use client"

import { useEffect, useState } from "react"
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

const statusConfig = {
  good: {
    text: "text-emerald-300",
    accent: "oklch(0.78 0.17 165)",
    glow: "oklch(0.78 0.17 165 / 0.35)",
    ring: "ring-emerald-400/20",
  },
  warning: {
    text: "text-amber-300",
    accent: "oklch(0.82 0.17 85)",
    glow: "oklch(0.82 0.17 85 / 0.35)",
    ring: "ring-amber-400/20",
  },
  critical: {
    text: "text-rose-300",
    accent: "oklch(0.72 0.22 25)",
    glow: "oklch(0.72 0.22 25 / 0.4)",
    ring: "ring-rose-400/20",
  },
  neutral: {
    text: "text-slate-200",
    accent: "oklch(0.78 0.15 210)",
    glow: "oklch(0.78 0.15 210 / 0.3)",
    ring: "ring-slate-400/20",
  },
}

function formatValue(value: number, format: "number" | "time" | "percentage"): string {
  switch (format) {
    case "time": {
      const minutes = Math.floor(value)
      const seconds = Math.round((value - minutes) * 60)
      return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }
    case "percentage":
      return `${value.toFixed(1)}%`
    default:
      return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0)
  }
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const height = 36
  const width = 88
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((val - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(" ")
  const areaPoints = `0,${height} ${points} ${width},${height}`
  const gradId = `spark-${color.replace(/[^a-z0-9]/gi, "")}-${data.length}`

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
      {(() => {
        const last = data[data.length - 1]
        const x = width
        const y = height - ((last - min) / range) * (height - 4) - 2
        return (
          <g>
            <circle cx={x} cy={y} r="3.5" fill={color} fillOpacity="0.25" />
            <circle cx={x} cy={y} r="2" fill={color} />
          </g>
        )
      })()}
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
  const [pulse, setPulse] = useState(false)
  const cfg = statusConfig[status]

  useEffect(() => {
    if (value !== displayValue) {
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 500)
      setDisplayValue(value)
      return () => clearTimeout(t)
    }
  }, [value, displayValue])

  const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl glass p-4 transition-all duration-300",
        "hover:border-white/15 hover:-translate-y-0.5",
        pulse && `ring-1 ${cfg.ring}`,
      )}
    >
      {/* Accent glow bar */}
      <div
        aria-hidden
        className="absolute inset-x-0 -top-px h-px opacity-60"
        style={{
          background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)`,
        }}
      />
      {/* Corner glow */}
      <div
        aria-hidden
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-30 transition-opacity group-hover:opacity-60"
        style={{ background: cfg.glow }}
      />

      <div className="relative flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <div
          className="p-1.5 rounded-lg glass-subtle"
          style={{ boxShadow: `inset 0 0 12px ${cfg.glow}` }}
        >
          {icon || <Activity className={cn("w-3.5 h-3.5", cfg.text)} />}
        </div>
      </div>

      <div className="relative flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1">
            <span
              className={cn("text-3xl font-bold tabular-nums leading-none tracking-tight", cfg.text)}
              style={{ textShadow: `0 0 20px ${cfg.glow}` }}
            >
              {formatValue(displayValue, format)}
            </span>
            {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
          </div>
          <div className="flex items-center gap-2 mt-2 text-[10px]">
            {target !== undefined && (
              <span className="text-muted-foreground">
                Target <span className="text-foreground/70 tabular-nums">{formatValue(target, format)}</span>
              </span>
            )}
            {trend !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold tabular-nums",
                  trend > 0 ? "text-emerald-300" : trend < 0 ? "text-rose-300" : "text-muted-foreground",
                )}
              >
                <TrendIcon className="w-2.5 h-2.5" strokeWidth={3} />
                {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
        {sparkline && <Sparkline data={sparkline} color={cfg.accent} />}
      </div>
    </div>
  )
}
