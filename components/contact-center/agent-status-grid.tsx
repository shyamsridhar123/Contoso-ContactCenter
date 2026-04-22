"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Phone, MessageSquare, Clock, Coffee, AlertTriangle, Users } from "lucide-react"

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
  "on-call": {
    label: "On Call",
    dot: "bg-emerald-400",
    ring: "ring-emerald-400/30",
    glow: "shadow-[0_0_0_4px_oklch(0.78_0.17_165/0.15)]",
    icon: Phone,
    pulse: true,
  },
  available: {
    label: "Available",
    dot: "bg-sky-400",
    ring: "ring-sky-400/30",
    glow: "shadow-[0_0_0_4px_oklch(0.78_0.15_210/0.15)]",
    icon: MessageSquare,
    pulse: false,
  },
  "wrap-up": {
    label: "Wrap-up",
    dot: "bg-amber-400",
    ring: "ring-amber-400/30",
    glow: "",
    icon: Clock,
    pulse: false,
  },
  break: {
    label: "On Break",
    dot: "bg-slate-400",
    ring: "ring-slate-400/20",
    glow: "",
    icon: Coffee,
    pulse: false,
  },
  offline: {
    label: "Offline",
    dot: "bg-slate-600",
    ring: "ring-slate-600/20",
    glow: "",
    icon: null,
    pulse: false,
  },
}

const sentimentConfig = {
  positive: { class: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20", label: "Positive" },
  neutral: { class: "bg-amber-400/10 text-amber-300 border-amber-400/20", label: "Neutral" },
  negative: { class: "bg-rose-400/10 text-rose-300 border-rose-400/20", label: "Escalation Risk" },
}

function AgentCard({ agent }: { agent: Agent }) {
  const config = statusConfig[agent.status]
  const Icon = config.icon
  const isCritical = agent.sentiment === "negative" && agent.status === "on-call"

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl glass p-3 transition-all duration-300",
        "hover:border-white/15 hover:-translate-y-0.5",
        isCritical && "ring-1 ring-rose-400/40 border-rose-400/30",
      )}
    >
      {isCritical && (
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl bg-rose-500/25 pointer-events-none" />
      )}
      {isCritical && (
        <div className="absolute top-2 right-2">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-300 animate-slow-pulse" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <Avatar className="w-10 h-10 ring-1 ring-white/10">
            <AvatarFallback className="text-[11px] font-semibold bg-white/5 text-foreground">
              {agent.initials}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-background",
              config.dot,
              config.pulse && "animate-slow-pulse",
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-xs truncate">{agent.name}</p>
            {Icon && <Icon className="w-3 h-3 text-muted-foreground shrink-0" />}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] text-muted-foreground">{config.label}</span>
            {agent.currentDuration && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/50" />
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {agent.currentDuration}
                </span>
              </>
            )}
          </div>

          {agent.sentiment && agent.status === "on-call" && (
            <div
              className={cn(
                "inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded border text-[9px] font-medium uppercase tracking-wider",
                sentimentConfig[agent.sentiment].class,
              )}
            >
              <span className="w-1 h-1 rounded-full bg-current animate-slow-pulse" />
              {sentimentConfig[agent.sentiment].label}
            </div>
          )}

          {agent.queue && agent.status !== "on-call" && (
            <p className="text-[10px] text-muted-foreground/80 mt-1 truncate">
              {agent.queue}
            </p>
          )}
        </div>
      </div>

      {agent.status !== "offline" && agent.status !== "break" && (
        <div className="grid grid-cols-3 gap-1 mt-3 pt-2.5 border-t border-white/5">
          <div className="text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Calls</p>
            <p className="text-xs font-semibold tabular-nums mt-0.5">{agent.callsHandled || 0}</p>
          </div>
          <div className="text-center border-x border-white/5">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">AHT</p>
            <p className="text-xs font-semibold tabular-nums mt-0.5">
              {agent.aht
                ? `${Math.floor(agent.aht)}:${String(Math.round((agent.aht % 1) * 60)).padStart(2, "0")}`
                : "—"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">FCR</p>
            <p className="text-xs font-semibold tabular-nums mt-0.5">
              {agent.fcr ? `${agent.fcr}%` : "—"}
            </p>
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

export function AgentStatusGrid({ agents, title = "Agent Floor" }: AgentStatusGridProps) {
  const statusCounts = {
    "on-call": agents.filter((a) => a.status === "on-call").length,
    available: agents.filter((a) => a.status === "available").length,
    "wrap-up": agents.filter((a) => a.status === "wrap-up").length,
    break: agents.filter((a) => a.status === "break").length,
    offline: agents.filter((a) => a.status === "offline").length,
  }

  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg glass-subtle">
            <Users className="w-4 h-4 text-sky-300" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
          <Badge variant="outline" className="border-white/10 bg-white/5 text-[10px] ml-1">
            {agents.length} agents
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  statusConfig[status as keyof typeof statusConfig].dot,
                )}
              />
              <span className="text-muted-foreground">
                <span className="text-foreground font-semibold tabular-nums">{count}</span>
                <span className="ml-1 capitalize hidden md:inline">{status.replace("-", " ")}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  )
}
