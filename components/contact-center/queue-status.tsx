"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Users, Clock, PhoneIncoming, AlertCircle } from "lucide-react"

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
  good: "text-emerald-500",
  warning: "text-amber-500",
  critical: "text-red-500",
}

const statusBgColors = {
  good: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function QueueCard({ queue }: { queue: QueueData }) {
  const slStatus = getServiceLevelStatus(queue.serviceLevel, queue.serviceLevelTarget)
  const waitStatus = getWaitTimeStatus(queue.avgWaitTime)
  const isAlert = queue.waitingCalls > 5 || queue.longestWait > 180

  return (
    <div
      className={cn(
        "p-4 rounded-lg border bg-card transition-all",
        isAlert && "border-amber-500/50 bg-amber-500/5"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-sm">{queue.name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {queue.agentsOnCall + queue.agentsAvailable} agents staffed
          </p>
        </div>
        {isAlert && <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-muted">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">{queue.waitingCalls}</p>
            <p className="text-xs text-muted-foreground">In Queue</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-muted">
            <Clock className={cn("w-3.5 h-3.5", statusColors[waitStatus])} />
          </div>
          <div>
            <p className={cn("text-lg font-bold tabular-nums", statusColors[waitStatus])}>
              {formatTime(queue.avgWaitTime)}
            </p>
            <p className="text-xs text-muted-foreground">Avg Wait</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Service Level</span>
          <span className={cn("font-semibold tabular-nums", statusColors[slStatus])}>
            {queue.serviceLevel}% / {queue.serviceLevelTarget}%
          </span>
        </div>
        <Progress
          value={queue.serviceLevel}
          className="h-1.5"
          style={{
            background: "var(--muted)",
          }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t">
        <div className="text-center">
          <p className="text-sm font-semibold text-emerald-500 tabular-nums">{queue.answered}</p>
          <p className="text-xs text-muted-foreground">Answered</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-red-500 tabular-nums">{queue.abandoned}</p>
          <p className="text-xs text-muted-foreground">Abandoned</p>
        </div>
        <div className="text-center">
          <p className={cn("text-sm font-semibold tabular-nums", statusColors[waitStatus])}>
            {formatTime(queue.longestWait)}
          </p>
          <p className="text-xs text-muted-foreground">Longest</p>
        </div>
      </div>
    </div>
  )
}

interface QueueStatusProps {
  queues: QueueData[]
  title?: string
}

export function QueueStatus({ queues, title = "Queue Status" }: QueueStatusProps) {
  const totalWaiting = queues.reduce((sum, q) => sum + q.waitingCalls, 0)
  const totalAgents = queues.reduce((sum, q) => sum + q.agentsOnCall + q.agentsAvailable, 0)
  const avgServiceLevel = Math.round(queues.reduce((sum, q) => sum + q.serviceLevel, 0) / queues.length)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <PhoneIncoming className="w-4 h-4" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{totalWaiting}</span> waiting
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{totalAgents}</span> agents
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">
                SL: <span className={cn("font-semibold", avgServiceLevel >= 80 ? "text-emerald-500" : "text-amber-500")}>{avgServiceLevel}%</span>
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {queues.map((queue) => (
            <QueueCard key={queue.id} queue={queue} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
