"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { 
  Phone, 
  Headphones, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Eye,
  Volume2
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
    color: "text-emerald-500", 
    bg: "bg-emerald-500/10",
    icon: TrendingUp 
  },
  neutral: { 
    color: "text-amber-500", 
    bg: "bg-amber-500/10",
    icon: Minus 
  },
  negative: { 
    color: "text-red-500", 
    bg: "bg-red-500/10",
    icon: TrendingDown 
  },
}

const trendConfig = {
  improving: { icon: TrendingUp, color: "text-emerald-500" },
  stable: { icon: Minus, color: "text-muted-foreground" },
  declining: { icon: TrendingDown, color: "text-red-500" },
}

function LiveCallCard({ call }: { call: LiveCall }) {
  const sentimentCfg = sentimentConfig[call.sentiment]
  const trendCfg = trendConfig[call.sentimentTrend]
  const TrendIcon = trendCfg.icon
  const isHighRisk = call.sentiment === "negative" || call.flags.length > 0

  return (
    <div
      className={cn(
        "p-3 rounded-lg border bg-card transition-all hover:shadow-sm",
        isHighRisk && "border-red-500/30 bg-red-500/5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              {call.agentInitials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">{call.agentName}</p>
              <Phone className="w-3 h-3 text-emerald-500" />
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {call.customerType} • {call.queue}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-mono tabular-nums text-muted-foreground">
            {call.duration}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Volume2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="text-xs">
          {call.topic}
        </Badge>
        <Badge className={cn("text-xs", sentimentCfg.bg, sentimentCfg.color)}>
          {call.sentiment}
          <TrendIcon className={cn("w-3 h-3 ml-1", trendCfg.color)} />
        </Badge>
        {call.flags.map((flag) => (
          <Badge key={flag} variant="destructive" className="text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {flag}
          </Badge>
        ))}
      </div>

      {call.transcriptPreview && (
        <div className="mt-3 p-2 rounded bg-muted/50 text-xs text-muted-foreground italic">
          &ldquo;{call.transcriptPreview}&rdquo;
        </div>
      )}
    </div>
  )
}

interface LiveCallsFeedProps {
  calls: LiveCall[]
  title?: string
}

export function LiveCallsFeed({ calls, title = "Live Calls" }: LiveCallsFeedProps) {
  const highRiskCalls = calls.filter(
    (c) => c.sentiment === "negative" || c.flags.length > 0
  ).length

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Headphones className="w-4 h-4" />
            {title}
            <Badge variant="secondary" className="ml-1">
              {calls.length} active
            </Badge>
          </CardTitle>
          {highRiskCalls > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {highRiskCalls} needs attention
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[400px] px-6">
          <div className="space-y-3 pb-4">
            {calls.map((call) => (
              <LiveCallCard key={call.id} call={call} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
