"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Phone,
  Headphones,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Volume2,
} from "lucide-react"

export interface LiveCall {
  id: string
  agentName: string
  agentInitials: string
  customerType: string
  queue: string
  duration: string
  sentiment: "positive" | "neutral" | "negative"
  sentimentTrend: "improving" | "stable" | "declining"
  topic: string
  flags: string[]
  transcriptPreview?: string
}

const sentimentConfig = {
  positive: {
    text: "text-emerald-300",
    bg: "bg-emerald-400/10 border-emerald-400/20",
    icon: TrendingUp,
    label: "Positive",
  },
  neutral: {
    text: "text-amber-300",
    bg: "bg-amber-400/10 border-amber-400/20",
    icon: Minus,
    label: "Neutral",
  },
  negative: {
    text: "text-rose-300",
    bg: "bg-rose-400/10 border-rose-400/20",
    icon: TrendingDown,
    label: "Negative",
  },
}

const trendConfig = {
  improving: { icon: TrendingUp, color: "text-emerald-300" },
  stable: { icon: Minus, color: "text-muted-foreground" },
  declining: { icon: TrendingDown, color: "text-rose-300" },
}

function LiveCallCard({ call, onMonitor }: { call: LiveCall; onMonitor?: (call: LiveCall) => void }) {
  const sentimentCfg = sentimentConfig[call.sentiment]
  const trendCfg = trendConfig[call.sentimentTrend]
  const TrendIcon = trendCfg.icon
  const isHighRisk = call.sentiment === "negative" || call.flags.length > 0

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl glass p-3 transition-all duration-300",
        "hover:border-white/15",
        isHighRisk && "ring-1 ring-rose-400/30 border-rose-400/20",
      )}
    >
      {isHighRisk && (
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl bg-rose-500/20 pointer-events-none" />
      )}

      <div className="relative flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full glass-subtle flex items-center justify-center text-[11px] font-semibold">
              {call.agentInitials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-background animate-slow-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-xs truncate">{call.agentName}</p>
              <Phone className="w-2.5 h-2.5 text-emerald-300 shrink-0" />
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {call.customerType} · {call.queue}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
            {call.duration}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-white/10"
            onClick={() => onMonitor?.(call)}
          >
            <Eye className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-white/10"
            onClick={() => onMonitor?.(call)}
          >
            <Volume2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="relative mt-2.5 flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[9px] font-medium uppercase tracking-wider">
          {call.topic}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-medium uppercase tracking-wider",
            sentimentCfg.bg,
            sentimentCfg.text,
          )}
        >
          {sentimentCfg.label}
          <TrendIcon className={cn("w-2.5 h-2.5", trendCfg.color)} strokeWidth={3} />
        </span>
        {call.flags.map((flag) => (
          <span
            key={flag}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-rose-400/30 bg-rose-400/10 text-rose-300 text-[9px] font-medium uppercase tracking-wider"
          >
            <AlertTriangle className="w-2.5 h-2.5" />
            {flag}
          </span>
        ))}
      </div>

      {call.transcriptPreview && (
        <div className="relative mt-2.5 p-2 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] text-muted-foreground italic leading-relaxed">
          &ldquo;{call.transcriptPreview}&rdquo;
        </div>
      )}
    </div>
  )
}

interface LiveCallsFeedProps {
  calls: LiveCall[]
  title?: string
  onMonitor?: (call: LiveCall) => void
}

export function LiveCallsFeed({ calls, title = "Live Calls", onMonitor }: LiveCallsFeedProps) {
  const highRiskCalls = calls.filter(
    (c) => c.sentiment === "negative" || c.flags.length > 0,
  ).length

  return (
    <div className="rounded-2xl glass p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg glass-subtle">
            <Headphones className="w-4 h-4 text-sky-300" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
          <Badge variant="outline" className="border-white/10 bg-white/5 text-[10px] ml-1 tabular-nums">
            {calls.length}
          </Badge>
        </div>
        {highRiskCalls > 0 && (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border border-rose-400/30 bg-rose-400/10 text-rose-300 text-[10px] font-medium uppercase tracking-wider">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-400" />
            </span>
            {highRiskCalls} needs attention
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 -mr-1 max-h-[520px]">
        <div className="space-y-2.5">
          {calls.map((call) => (
            <LiveCallCard key={call.id} call={call} onMonitor={onMonitor} />
          ))}
        </div>
      </div>
    </div>
  )
}
