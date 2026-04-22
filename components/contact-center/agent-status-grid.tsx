"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Phone, MessageSquare, Clock, Coffee, AlertTriangle } from "lucide-react"

export interface Agent {
  id: string
  name: string
  initials: string
  status: "on-call" | "available" | "wrap-up" | "break" | "offline"
  currentDuration?: string
  sentiment?: "positive" | "neutral" | "negative"
  queue?: string
  callsHandled?: number
  aht?: number
  fcr?: number
}

const statusConfig = {
  "on-call": { label: "On Call", color: "bg-emerald-500", icon: Phone, pulse: true },
  available: { label: "Available", color: "bg-blue-500", icon: MessageSquare, pulse: false },
  "wrap-up": { label: "Wrap-up", color: "bg-amber-500", icon: Clock, pulse: false },
  break: { label: "On Break", color: "bg-gray-400", icon: Coffee, pulse: false },
  offline: { label: "Offline", color: "bg-gray-300", icon: null, pulse: false },
}

const sentimentConfig = {
  positive: { color: "text-emerald-500 bg-emerald-500/10", label: "Positive" },
  neutral: { color: "text-amber-500 bg-amber-500/10", label: "Neutral" },
  negative: { color: "text-red-500 bg-red-500/10", label: "Escalation Risk" },
}

function AgentCard({ agent }: { agent: Agent }) {
  const config = statusConfig[agent.status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "relative p-3 rounded-lg border bg-card transition-all hover:shadow-md",
        agent.sentiment === "negative" && "border-red-500/50 bg-red-500/5"
      )}
    >
      {agent.sentiment === "negative" && (
        <div className="absolute -top-1 -right-1">
          <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="text-xs font-medium bg-muted">
              {agent.initials}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background",
              config.color,
              config.pulse && "animate-pulse"
            )}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm truncate">{agent.name}</p>
            {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {config.label}
            </Badge>
            {agent.currentDuration && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {agent.currentDuration}
              </span>
            )}
          </div>

          {agent.sentiment && agent.status === "on-call" && (
            <Badge className={cn("text-xs mt-2 px-1.5 py-0", sentimentConfig[agent.sentiment].color)}>
              {sentimentConfig[agent.sentiment].label}
            </Badge>
          )}

          {agent.queue && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {agent.queue}
            </p>
          )}
        </div>
      </div>

      {agent.status !== "offline" && agent.status !== "break" && (
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Calls</p>
            <p className="text-sm font-semibold tabular-nums">{agent.callsHandled || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">AHT</p>
            <p className="text-sm font-semibold tabular-nums">
              {agent.aht ? `${Math.floor(agent.aht)}:${String(Math.round((agent.aht % 1) * 60)).padStart(2, "0")}` : "-"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">FCR</p>
            <p className="text-sm font-semibold tabular-nums">{agent.fcr ? `${agent.fcr}%` : "-"}</p>
          </div>
        </div>
      )}
    </div>
  )
}

interface AgentStatusGridProps {
  agents: Agent[]
  title?: string
}

export function AgentStatusGrid({ agents, title = "Agent Status" }: AgentStatusGridProps) {
  const statusCounts = {
    "on-call": agents.filter((a) => a.status === "on-call").length,
    available: agents.filter((a) => a.status === "available").length,
    "wrap-up": agents.filter((a) => a.status === "wrap-up").length,
    break: agents.filter((a) => a.status === "break").length,
    offline: agents.filter((a) => a.status === "offline").length,
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex items-center gap-3 text-xs">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className={cn("w-2 h-2 rounded-full", statusConfig[status as keyof typeof statusConfig].color)} />
                <span className="text-muted-foreground capitalize">
                  {count} {status.replace("-", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
