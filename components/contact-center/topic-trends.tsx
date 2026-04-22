"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, AlertTriangle, MessageSquare } from "lucide-react"

export interface TopicData {
  id: string
  name: string
  volume: number
  percentChange: number
  sentiment: "positive" | "neutral" | "negative"
  isSpike: boolean
}

function TopicRow({ topic, maxVolume }: { topic: TopicData; maxVolume: number }) {
  const barWidth = (topic.volume / maxVolume) * 100
  const TrendIcon = topic.percentChange > 0 ? TrendingUp : topic.percentChange < 0 ? TrendingDown : Minus

  const sentimentConfig = {
    positive: { bar: "oklch(0.78 0.17 165)", glow: "oklch(0.78 0.17 165 / 0.3)" },
    neutral: { bar: "oklch(0.82 0.17 85)", glow: "oklch(0.82 0.17 85 / 0.3)" },
    negative: { bar: "oklch(0.72 0.22 25)", glow: "oklch(0.72 0.22 25 / 0.35)" },
  }
  const cfg = sentimentConfig[topic.sentiment]

  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-36 shrink-0 flex items-center gap-1.5">
        {topic.isSpike && (
          <AlertTriangle className="w-3 h-3 text-amber-300 animate-slow-pulse shrink-0" />
        )}
        <span className="text-xs font-medium truncate">{topic.name}</span>
      </div>

      <div className="flex-1 h-6 rounded-full overflow-hidden relative glass-subtle">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out relative"
          style={{
            width: `${barWidth}%`,
            background: `linear-gradient(90deg, ${cfg.bar}70 0%, ${cfg.bar} 100%)`,
            boxShadow: `0 0 12px ${cfg.glow}`,
          }}
        >
          <div className="absolute inset-0 animate-shimmer rounded-full" />
        </div>
        <span className="absolute inset-0 flex items-center px-3 text-[10px] font-semibold tabular-nums text-foreground/90">
          {topic.volume} calls
        </span>
      </div>

      <div
        className={cn(
          "flex items-center gap-0.5 w-14 shrink-0 text-[11px] font-semibold tabular-nums justify-end",
          topic.percentChange > 0
            ? "text-emerald-300"
            : topic.percentChange < 0
              ? "text-rose-300"
              : "text-muted-foreground",
        )}
      >
        <TrendIcon className="w-3 h-3" strokeWidth={3} />
        {topic.percentChange > 0 ? "+" : ""}
        {topic.percentChange}%
      </div>

      {topic.isSpike && (
        <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded border border-rose-400/30 bg-rose-400/10 text-rose-300 text-[9px] font-semibold uppercase tracking-wider">
          Spike
        </span>
      )}
    </div>
  )
}

interface TopicTrendsProps {
  topics: TopicData[]
  title?: string
}

export function TopicTrends({ topics, title = "Trending Topics" }: TopicTrendsProps) {
  const maxVolume = Math.max(...topics.map((t) => t.volume))
  const spikes = topics.filter((t) => t.isSpike).length

  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg glass-subtle">
            <MessageSquare className="w-4 h-4 text-sky-300" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
        </div>
        {spikes > 0 && (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-[10px] font-medium uppercase tracking-wider">
            <AlertTriangle className="w-2.5 h-2.5" />
            {spikes} spike{spikes > 1 ? "s" : ""}
          </div>
        )}
      </div>
      <div className="space-y-0.5">
        {topics.map((topic) => (
          <TopicRow key={topic.id} topic={topic} maxVolume={maxVolume} />
        ))}
      </div>
    </div>
  )
}
