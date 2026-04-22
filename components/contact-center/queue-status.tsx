"use client"

import { cn } from "@/lib/utils"
import { Users, Clock, PhoneIncoming, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface QueueData {
  id: string
  name: string
  waitingCalls: number
  avgWaitTime: number
  longestWait: number
  agentsAvailable: number
  agentsOnCall: number
  serviceLevel: number
  serviceLevelTarget: number
  abandoned: number
  answered: number
}

function getServiceLevelStatus(current: number, target: number): "good" | "warning" | "critical" {
  if (current >= target) return "good"
  if (current >= target - 10) return "warning"
  return "critical"
}

function getWaitTimeStatus(waitTime: number): "good" | "warning" | "critical" {
  if (waitTime < 60) return "good"
  if (waitTime < 120) return "warning"
  return "critical"
}

const statusColors = {
  good: { text: "text-emerald-300", bar: "oklch(0.78 0.17 165)", glow: "oklch(0.78 0.17 165 / 0.35)" },
  warning: { text: "text-amber-300", bar: "oklch(0.82 0.17 85)", glow: "oklch(0.82 0.17 85 / 0.35)" },
  critical: { text: "text-rose-300", bar: "oklch(0.72 0.22 25)", glow: "oklch(0.72 0.22 25 / 0.4)" },
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function ProgressBar({ value, color, glow }: { value: number; color: string; glow: string }) {
  return (
    <div className="relative h-1.5 rounded-full overflow-hidden bg-white/5">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out relative"
        style={{
          width: `${Math.min(value, 100)}%`,
          background: `linear-gradient(90deg, ${color} 0%, ${color} 100%)`,
          boxShadow: `0 0 12px ${glow}`,
        }}
      >
        <div className="absolute inset-0 animate-shimmer rounded-full" />
      </div>
    </div>
  )
}

function QueueCard({ queue }: { queue: QueueData }) {
  const slStatus = getServiceLevelStatus(queue.serviceLevel, queue.serviceLevelTarget)
  const waitStatus = getWaitTimeStatus(queue.avgWaitTime)
  const isAlert = queue.waitingCalls > 5 || queue.longestWait > 180
  const slCfg = statusColors[slStatus]
  const waitCfg = statusColors[waitStatus]

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl glass p-4 transition-all duration-300",
        "hover:border-white/15 hover:-translate-y-0.5",
        isAlert && "ring-1 ring-amber-400/30 border-amber-400/20",
      )}
    >
      {isAlert && (
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl bg-amber-500/20 pointer-events-none" />
      )}

      <div className="relative flex items-start justify-between mb-3">
        <div className="min-w-0">
          <h4 className="font-semibold text-sm truncate">{queue.name}</h4>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
            {queue.agentsOnCall + queue.agentsAvailable} staffed · {queue.agentsAvailable} avail
          </p>
        </div>
        {isAlert && <AlertCircle className="w-4 h-4 text-amber-300 animate-slow-pulse shrink-0" />}
      </div>

      <div className="relative grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg glass-subtle p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">In Queue</span>
          </div>
          <p className={cn(
            "text-2xl font-bold tabular-nums leading-none",
            queue.waitingCalls > 5 ? "text-amber-300" : "text-foreground",
          )}>
            {queue.waitingCalls}
          </p>
        </div>
        <div className="rounded-lg glass-subtle p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className={cn("w-3 h-3", waitCfg.text)} />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Wait</span>
          </div>
          <p className={cn("text-2xl font-bold tabular-nums leading-none", waitCfg.text)}>
            {formatTime(queue.avgWaitTime)}
          </p>
        </div>
      </div>

      <div className="relative space-y-1.5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
          <span className="text-muted-foreground">Service Level</span>
          <span className={cn("font-semibold tabular-nums", slCfg.text)}>
            {queue.serviceLevel.toFixed(1)}% / {queue.serviceLevelTarget}%
          </span>
        </div>
        <ProgressBar value={queue.serviceLevel} color={slCfg.bar} glow={slCfg.glow} />
      </div>

      <div className="relative grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5">
        <div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Answered</p>
          <p className="text-sm font-semibold text-emerald-300 tabular-nums mt-0.5">
            {queue.answered}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Abandoned</p>
          <p className="text-sm font-semibold text-rose-300 tabular-nums mt-0.5">
            {queue.abandoned}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Longest</p>
          <p className={cn("text-sm font-semibold tabular-nums mt-0.5", waitCfg.text)}>
            {formatTime(queue.longestWait)}
          </p>
        </div>
      </div>
    </div>
  )
}

interface QueueStatusProps {
  queues: QueueData[]
  title?: string
}

export function QueueStatus({ queues, title = "Queues" }: QueueStatusProps) {
  const totalWaiting = queues.reduce((sum, q) => sum + q.waitingCalls, 0)
  const totalAgents = queues.reduce((sum, q) => sum + q.agentsOnCall + q.agentsAvailable, 0)
  const avgServiceLevel = Math.round(queues.reduce((sum, q) => sum + q.serviceLevel, 0) / queues.length)

  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg glass-subtle">
            <PhoneIncoming className="w-4 h-4 text-sky-300" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
          <Badge variant="outline" className="border-white/10 bg-white/5 text-[10px] ml-1">
            {queues.length} active
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground uppercase tracking-wider">Waiting</span>
            <span className="font-semibold text-amber-300 tabular-nums">{totalWaiting}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground uppercase tracking-wider">Agents</span>
            <span className="font-semibold tabular-nums">{totalAgents}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground uppercase tracking-wider">Avg SL</span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                avgServiceLevel >= 80 ? "text-emerald-300" : "text-amber-300",
              )}
            >
              {avgServiceLevel.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {queues.map((queue) => (
          <QueueCard key={queue.id} queue={queue} />
        ))}
      </div>
    </div>
  )
}
