"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Headphones,
  MicOff,
  PhoneForwarded,
  Shield,
  X,
  Brain,
  Lightbulb,
  TrendingUp,
  Sparkles,
  Radio,
  MessageSquare,
  DollarSign,
  ClipboardCheck,
  Heart,
} from "lucide-react"
import type { LiveCall } from "@/components/contact-center/live-calls-feed"
import type {
  TranscriptLine,
  AiSuggestion,
  QmScore,
  CallTranscriptState,
} from "@/hooks/use-call-transcript"

interface CallListenPanelProps {
  call: LiveCall | null
  transcriptState: CallTranscriptState & {
    startListening: () => void
    stopListening: () => void
  }
  open: boolean
  onClose: () => void
}

const suggestionIcons: Record<AiSuggestion["type"], typeof Brain> = {
  knowledge: Lightbulb,
  compliance: Shield,
  empathy: Heart,
  upsell: DollarSign,
  procedure: ClipboardCheck,
}

const suggestionColors: Record<AiSuggestion["type"], { border: string; bg: string; text: string; badge: string }> = {
  knowledge: { border: "border-sky-400/30", bg: "bg-sky-400/10", text: "text-sky-300", badge: "Knowledge Base" },
  compliance: { border: "border-amber-400/30", bg: "bg-amber-400/10", text: "text-amber-300", badge: "Compliance" },
  empathy: { border: "border-pink-400/30", bg: "bg-pink-400/10", text: "text-pink-300", badge: "Empathy Cue" },
  upsell: { border: "border-emerald-400/30", bg: "bg-emerald-400/10", text: "text-emerald-300", badge: "Opportunity" },
  procedure: { border: "border-violet-400/30", bg: "bg-violet-400/10", text: "text-violet-300", badge: "Procedure" },
}

function TranscriptLineItem({ line }: { line: TranscriptLine }) {
  if (line.speaker === "system") {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[9px] text-muted-foreground uppercase tracking-widest px-2">{line.text}</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
    )
  }

  const isAgent = line.speaker === "agent"
  const sentimentColor = line.sentiment === "positive" ? "text-emerald-400" : line.sentiment === "negative" ? "text-rose-400" : "text-white/40"

  return (
    <div className={cn("flex gap-2.5 py-1.5", isAgent ? "flex-row" : "flex-row-reverse")}>
      <div
        className={cn(
          "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5",
          isAgent ? "glass-strong text-sky-300" : "glass-subtle text-amber-300",
        )}
      >
        {isAgent ? "A" : "C"}
      </div>
      <div className={cn("max-w-[80%] space-y-0.5", isAgent ? "items-start" : "items-end")}>
        <div
          className={cn(
            "rounded-xl px-3 py-2 text-xs leading-relaxed",
            isAgent ? "glass-subtle rounded-tl-sm" : "glass rounded-tr-sm",
            line.isPartial && "border-l-2 border-sky-400/50",
          )}
        >
          {line.text}
          {line.isPartial && (
            <span className="inline-block w-1 h-3 ml-0.5 bg-sky-400 animate-pulse rounded-full align-middle" />
          )}
        </div>
        <div className="flex items-center gap-1.5 px-1">
          <span className="text-[9px] text-muted-foreground tabular-nums">{line.timestamp}</span>
          <span className={cn("w-1.5 h-1.5 rounded-full", sentimentColor.replace("text-", "bg-"))} />
        </div>
      </div>
    </div>
  )
}

function SuggestionCard({ suggestion }: { suggestion: AiSuggestion }) {
  const colors = suggestionColors[suggestion.type]
  const Icon = suggestionIcons[suggestion.type]

  return (
    <div
      className={cn(
        "rounded-lg border p-2.5 transition-all duration-500",
        colors.border,
        colors.bg,
        suggestion.isNew && "ring-1 ring-white/20 animate-in slide-in-from-right-5 fade-in duration-500",
      )}
    >
      <div className="flex items-start gap-2">
        <div className={cn("p-1 rounded-md glass-subtle shrink-0", colors.text)}>
          <Icon className="w-3 h-3" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-semibold truncate">{suggestion.title}</span>
            <Badge variant="outline" className={cn("text-[8px] px-1 py-0 h-3.5 border-white/10", colors.text)}>
              {colors.badge}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{suggestion.text}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-muted-foreground">Confidence</span>
              <div className="w-12 h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={cn("h-full rounded-full", colors.bg.replace("/10", "/60"))}
                  style={{ width: `${suggestion.confidence * 100}%` }}
                />
              </div>
              <span className="text-[8px] tabular-nums text-muted-foreground">{Math.round(suggestion.confidence * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QmScoreCard({ score }: { score: QmScore }) {
  const categories = [
    { label: "Greeting", value: score.greeting },
    { label: "Empathy", value: score.empathy },
    { label: "Compliance", value: score.compliance },
    { label: "Resolution", value: score.resolution },
    { label: "Closing", value: score.closing },
  ]

  const overallColor = score.overall >= 80 ? "text-emerald-300" : score.overall >= 60 ? "text-amber-300" : "text-rose-300"

  return (
    <div className="rounded-xl glass-subtle p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ClipboardCheck className="w-3.5 h-3.5 text-violet-300" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">QM Score</span>
        </div>
        <span className={cn("text-lg font-bold tabular-nums", overallColor)}>{score.overall}</span>
      </div>
      <div className="space-y-1.5">
        {categories.map((cat) => (
          <div key={cat.label} className="flex items-center gap-2">
            <span className="text-[9px] text-muted-foreground w-16 shrink-0">{cat.label}</span>
            <Progress value={cat.value} className="h-1.5 flex-1" />
            <span className="text-[9px] tabular-nums text-muted-foreground w-6 text-right">{Math.round(cat.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SentimentMiniChart({ data }: { data: Array<{ time: string; score: number }> }) {
  if (data.length < 2) return null

  const height = 40
  const width = 200
  const min = 0
  const max = 100

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((d.score - min) / (max - min)) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(" ")

  const midY = height - ((50 - min) / (max - min)) * (height - 4) - 2

  return (
    <div className="rounded-xl glass-subtle p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <TrendingUp className="w-3.5 h-3.5 text-sky-300" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">Sentiment Flow</span>
      </div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <line x1="0" y1={midY} x2={width} y2={midY} stroke="white" strokeOpacity="0.1" strokeDasharray="3 3" />
        <defs>
          <linearGradient id="sentGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.17 165)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="oklch(0.82 0.17 85)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="oklch(0.72 0.22 25)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <polygon fill="url(#sentGrad)" points={`0,${height} ${points} ${width},${height}`} />
        <polyline fill="none" stroke="oklch(0.78 0.17 250)" strokeWidth="1.5" strokeLinejoin="round" points={points} />
      </svg>
      <div className="flex justify-between text-[8px] text-muted-foreground mt-1">
        <span>Negative</span>
        <span>Neutral</span>
        <span>Positive</span>
      </div>
    </div>
  )
}

export function CallListenPanel({ call, transcriptState, open, onClose }: CallListenPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { transcript, suggestions, qmScore, sentimentTimeline, isListening, startListening, stopListening } = transcriptState

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcript])

  // Start listening when panel opens
  useEffect(() => {
    if (open && call && !isListening) {
      startListening()
    }
  }, [open, call, isListening, startListening])

  // Stop listening when panel closes
  useEffect(() => {
    if (!open && isListening) {
      stopListening()
    }
  }, [open, isListening, stopListening])

  if (!call) return null

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[680px] p-0 glass border-l border-white/10 bg-background/95 backdrop-blur-2xl overflow-hidden [&>button]:hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-5 py-4 border-b border-white/10 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-sm font-bold">
                    {call.agentInitials}
                  </div>
                  {isListening && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-background animate-slow-pulse" />
                  )}
                </div>
                <div>
                  <SheetTitle className="text-sm font-semibold">{call.agentName}</SheetTitle>
                  <p className="text-[10px] text-muted-foreground">{call.customerType} · {call.queue} · {call.topic}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isListening && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-400/30 bg-emerald-400/10">
                    <Radio className="w-3 h-3 text-emerald-300 animate-pulse" />
                    <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">Monitoring</span>
                  </div>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Supervisor Controls */}
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  "h-7 text-[10px] gap-1.5 glass-subtle border-white/10",
                  isListening && "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
                )}
                onClick={() => (isListening ? stopListening() : startListening())}
              >
                <Headphones className="w-3 h-3" />
                {isListening ? "Listening" : "Listen"}
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1.5 glass-subtle border-white/10 hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-300">
                <MicOff className="w-3 h-3" />
                Whisper
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1.5 glass-subtle border-white/10 hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-300">
                <PhoneForwarded className="w-3 h-3" />
                Barge-in
              </Button>
              <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="tabular-nums font-mono">{call.duration}</span>
              </div>
            </div>
          </SheetHeader>

          {/* Main Content — 2-column layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Transcript */}
            <div className="flex-1 flex flex-col border-r border-white/5 min-w-0">
              <div className="px-4 py-2 border-b border-white/5 flex items-center gap-1.5 shrink-0">
                <MessageSquare className="w-3 h-3 text-sky-300" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Live Transcript</span>
                <Badge variant="outline" className="border-white/10 text-[8px] ml-auto tabular-nums">
                  {transcript.filter((t) => t.speaker !== "system").length} lines
                </Badge>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin">
                <div className="space-y-0.5">
                  {transcript.map((line) => (
                    <TranscriptLineItem key={line.id} line={line} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: AI Assist + Scores */}
            <div className="w-[240px] flex flex-col shrink-0 overflow-hidden">
              <div className="px-3 py-2 border-b border-white/5 flex items-center gap-1.5 shrink-0">
                <Sparkles className="w-3 h-3 text-violet-300" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">AI Assist</span>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin">
                {/* AI Suggestions */}
                {suggestions.length > 0 ? (
                  <div className="space-y-2">
                    {suggestions.map((s) => (
                      <SuggestionCard key={s.id} suggestion={s} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Brain className="w-6 h-6 text-muted-foreground/40 mb-2" />
                    <p className="text-[10px] text-muted-foreground">AI suggestions will appear as the conversation progresses</p>
                  </div>
                )}

                {/* Sentiment Chart */}
                <SentimentMiniChart data={sentimentTimeline} />

                {/* QM Score */}
                <QmScoreCard score={qmScore} />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
