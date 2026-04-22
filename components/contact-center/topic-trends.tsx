"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  
  const sentimentColors = {
    positive: "bg-emerald-500",
    neutral: "bg-amber-500",
    negative: "bg-red-500",
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-32 shrink-0 flex items-center gap-2">
        {topic.isSpike && (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
        )}
        <span className="text-sm font-medium truncate">{topic.name}</span>
      </div>
      
      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden relative">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            sentimentColors[topic.sentiment],
            topic.sentiment === "negative" ? "opacity-70" : "opacity-50"
          )}
          style={{ width: `${barWidth}%` }}
        />
        <span className="absolute inset-0 flex items-center px-3 text-xs font-medium">
          {topic.volume} calls
        </span>
      </div>
      
      <div className={cn(
        "flex items-center gap-1 w-16 shrink-0 text-xs font-medium",
        topic.percentChange > 0 ? "text-emerald-500" : topic.percentChange < 0 ? "text-red-500" : "text-muted-foreground"
      )}>
        <TrendIcon className="w-3 h-3" />
        {topic.percentChange > 0 ? "+" : ""}{topic.percentChange}%
      </div>
      
      {topic.isSpike && (
        <Badge variant="destructive" className="shrink-0 text-xs">
          Spike
        </Badge>
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {title}
          </CardTitle>
          {spikes > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {spikes} topic spike{spikes > 1 ? "s" : ""} detected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {topics.map((topic) => (
            <TopicRow key={topic.id} topic={topic} maxVolume={maxVolume} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
