"use client"

import { useState, useEffect } from "react"
import { useLiveSimulation } from "@/hooks/use-live-simulation"
import { RadialGauge } from "@/components/contact-center/radial-gauge"
import { LiveMetricCard } from "@/components/contact-center/live-metric-card"
import { AgentStatusGrid } from "@/components/contact-center/agent-status-grid"
import { QueueStatus } from "@/components/contact-center/queue-status"
import { LiveCallsFeed } from "@/components/contact-center/live-calls-feed"
import { SiteComparison } from "@/components/contact-center/site-comparison"
import { TopicTrends } from "@/components/contact-center/topic-trends"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Phone,
  Activity,
  Clock,
  TrendingUp,
  BarChart3,
  Sparkles,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

function LiveIndicator() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-subtle border border-emerald-400/20">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-300">
        Live
      </span>
    </div>
  )
}

function CurrentTime() {
  const [time, setTime] = useState<Date>(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTime(new Date())
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-right">
      <p className="text-xl font-bold tabular-nums tracking-tight text-gradient" suppressHydrationWarning>
        {mounted ? time.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) : "--:--:--"}
      </p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider" suppressHydrationWarning>
        {mounted ? time.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }) : "Loading"}
      </p>
    </div>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 rounded-xl bg-sky-400/30 blur-md" />
        <div className="relative p-2 rounded-xl glass-strong border-sky-400/20">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-sky-300"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <div>
        <p className="text-sm font-bold tracking-tight">Contoso Bank</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
          Command Center
        </p>
      </div>
    </div>
  )
}

function StatPill({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: string
  tone?: "neutral" | "good" | "warning" | "critical"
}) {
  const toneClass = {
    neutral: "text-foreground",
    good: "text-emerald-300",
    warning: "text-amber-300",
    critical: "text-rose-300",
  }[tone]

  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className={cn("font-bold tabular-nums", toneClass)}>{value}</span>
    </div>
  )
}

export default function CommandCenterPage() {
  const { agents, queues, liveCalls, sites, topics, metrics } = useLiveSimulation(3000)

  const fcrStatus =
    metrics.fcr >= metrics.fcrTarget
      ? "success"
      : metrics.fcr >= metrics.fcrTarget - 5
        ? "warning"
        : "danger"
  const ahtStatus =
    metrics.aht <= metrics.ahtTarget
      ? "good"
      : metrics.aht <= metrics.ahtTarget + 1
        ? "warning"
        : "critical"
  const csatStatus =
    metrics.csat >= metrics.csatTarget
      ? "success"
      : metrics.csat >= metrics.csatTarget - 0.3
        ? "warning"
        : "danger"
  const slStatus =
    metrics.serviceLevel >= metrics.serviceLevelTarget
      ? "success"
      : metrics.serviceLevel >= metrics.serviceLevelTarget - 5
        ? "warning"
        : "danger"
  const npsStatus = metrics.nps >= 50 ? "success" : metrics.nps >= 30 ? "warning" : "danger"

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-2xl bg-background/40">
        <div className="mx-auto max-w-[1600px] px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <Logo />
            <div className="hidden md:block h-8 w-px bg-white/10" />
            <LiveIndicator />
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-5">
              <StatPill
                label="Handled"
                value={metrics.callsHandledToday.toLocaleString()}
              />
              <StatPill
                label="Wait"
                value={`${Math.floor(metrics.avgWaitTime)}s`}
                tone={metrics.avgWaitTime > 60 ? "warning" : "good"}
              />
              <StatPill
                label="Sites"
                value={`${sites.length}`}
              />
              <StatPill
                label="Online"
                value={`${agents.filter((a) => a.status !== "offline").length}`}
                tone="good"
              />
            </div>
            <CurrentTime />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-6 space-y-6">
        {/* Hero headline */}
        <div className="flex items-end justify-between flex-wrap gap-3 pt-2">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full glass-subtle mb-3">
              <Sparkles className="w-3 h-3 text-sky-300" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Real-time Operations
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient text-balance">
              Good morning, Operations.
            </h1>
            <p className="text-sm text-muted-foreground mt-1 text-pretty">
              {agents.filter((a) => a.status === "on-call").length} agents on live calls · {" "}
              <span className="text-amber-300">{metrics.callsInQueue}</span> customers waiting · {" "}
              <span className="text-emerald-300">{metrics.fcr.toFixed(1)}%</span> FCR today
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[11px] text-muted-foreground">
              Auto-refreshing every 3s
            </span>
          </div>
        </div>

        {/* Hero gauges + live metric cards — bento layout */}
        <section>
          <div className="grid grid-cols-12 gap-4">
            {/* 5 gauges across, compressed on smaller screens */}
            <div className="col-span-12 xl:col-span-8 rounded-2xl glass p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg glass-subtle">
                    <Activity className="w-4 h-4 text-sky-300" />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider">
                    Key Performance
                  </h2>
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Live · Shift to date
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center justify-items-center">
                <RadialGauge
                  value={metrics.fcr}
                  max={100}
                  label="First Call Resolution"
                  size="md"
                  colorScheme={fcrStatus}
                  showTrend
                  trend={metrics.fcrTrend}
                />
                <RadialGauge
                  value={metrics.serviceLevel}
                  max={100}
                  label="Service Level"
                  size="md"
                  colorScheme={slStatus}
                  showTrend
                  trend={metrics.serviceLevel > metrics.serviceLevelTarget ? 1.5 : -2.1}
                />
                <RadialGauge
                  value={metrics.csat * 20}
                  max={100}
                  label="CSAT"
                  unit=""
                  size="md"
                  colorScheme={csatStatus}
                  showTrend
                  trend={metrics.csatTrend}
                />
                <RadialGauge
                  value={metrics.nps}
                  max={100}
                  label="Net Promoter"
                  unit=""
                  size="md"
                  colorScheme={npsStatus}
                  showTrend
                  trend={metrics.npsTrend}
                />
                <RadialGauge
                  value={100 - metrics.abandonRate * 10}
                  max={100}
                  label="Abandon Health"
                  unit=""
                  size="md"
                  colorScheme={
                    metrics.abandonRate > 5 ? "danger" : metrics.abandonRate > 3 ? "warning" : "success"
                  }
                  sublabel={`${metrics.abandonRate.toFixed(1)}% abd`}
                />
              </div>
            </div>

            {/* 4 live metric cards in 2x2 */}
            <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-4">
              <LiveMetricCard
                title="Active Agents"
                value={metrics.activeAgents}
                icon={<Users className="w-3.5 h-3.5 text-sky-300" />}
                status="good"
                trend={2}
              />
              <LiveMetricCard
                title="In Queue"
                value={metrics.callsInQueue}
                icon={<Phone className="w-3.5 h-3.5 text-amber-300" />}
                status={metrics.callsInQueue > 30 ? "warning" : "good"}
                trend={metrics.callsInQueue > 20 ? 15 : -5}
              />
              <LiveMetricCard
                title="Avg Handle"
                value={metrics.aht}
                format="time"
                target={metrics.ahtTarget}
                icon={<Clock className="w-3.5 h-3.5 text-sky-300" />}
                status={ahtStatus}
                sparkline={metrics.ahtSparkline}
              />
              <LiveMetricCard
                title="Abandon Rate"
                value={metrics.abandonRate}
                format="percentage"
                icon={<Activity className="w-3.5 h-3.5 text-rose-300" />}
                status={
                  metrics.abandonRate > 5 ? "critical" : metrics.abandonRate > 3 ? "warning" : "good"
                }
                trend={metrics.abandonRate > 3 ? 8 : -12}
              />
            </div>
          </div>
        </section>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList className="glass h-10 p-1 border-white/10">
              <TabsTrigger
                value="overview"
                className="gap-1.5 text-xs data-[state=active]:glass-strong data-[state=active]:text-foreground"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="agents"
                className="gap-1.5 text-xs data-[state=active]:glass-strong data-[state=active]:text-foreground"
              >
                <Users className="w-3.5 h-3.5" />
                Agents
              </TabsTrigger>
              <TabsTrigger
                value="queues"
                className="gap-1.5 text-xs data-[state=active]:glass-strong data-[state=active]:text-foreground"
              >
                <Phone className="w-3.5 h-3.5" />
                Queues
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="gap-1.5 text-xs data-[state=active]:glass-strong data-[state=active]:text-foreground"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Insights
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-5 mt-0">
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-1">
                <LiveCallsFeed calls={liveCalls} />
              </div>
              <div className="lg:col-span-2">
                <QueueStatus queues={queues} />
              </div>
            </div>
            <SiteComparison sites={sites} />
          </TabsContent>

          <TabsContent value="agents" className="space-y-5 mt-0">
            <AgentStatusGrid agents={agents} />
          </TabsContent>

          <TabsContent value="queues" className="space-y-5 mt-0">
            <QueueStatus queues={queues} />
            <div className="grid lg:grid-cols-2 gap-5">
              <TopicTrends topics={topics} />
              <LiveCallsFeed calls={liveCalls} title="Calls Needing Attention" />
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-5 mt-0">
            <div className="grid lg:grid-cols-2 gap-5">
              <TopicTrends topics={topics} />
              <div className="rounded-2xl glass p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg glass-subtle">
                    <TrendingUp className="w-4 h-4 text-sky-300" />
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider">
                    Performance Trends
                  </h3>
                </div>
                <div className="space-y-5">
                  <TrendChart
                    label="First Call Resolution"
                    data={metrics.fcrSparkline}
                    value={`${metrics.fcr.toFixed(1)}%`}
                    status={fcrStatus === "success" ? "good" : fcrStatus === "warning" ? "warning" : "critical"}
                  />
                  <TrendChart
                    label="Service Level"
                    data={metrics.slSparkline}
                    value={`${metrics.serviceLevel.toFixed(1)}%`}
                    status={slStatus === "success" ? "good" : slStatus === "warning" ? "warning" : "critical"}
                  />
                  <TrendChart
                    label="CSAT Score"
                    data={metrics.csatSparkline}
                    value={metrics.csat.toFixed(2)}
                    status={csatStatus === "success" ? "good" : csatStatus === "warning" ? "warning" : "critical"}
                  />
                </div>
              </div>
            </div>
            <SiteComparison sites={sites} />
          </TabsContent>
        </Tabs>

        <footer className="pt-6 pb-4 border-t border-white/5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider flex-wrap gap-2">
            <p>Contoso Bank · AI-Enhanced Contact Center Platform</p>
            <p>All metrics simulated · Updated in real-time</p>
          </div>
        </footer>
      </main>
    </div>
  )
}

function TrendChart({
  label,
  data,
  value,
  status,
}: {
  label: string
  data: number[]
  value: string
  status: "good" | "warning" | "critical"
}) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const height = 56
  const width = 420

  const color = {
    good: "oklch(0.78 0.17 165)",
    warning: "oklch(0.82 0.17 85)",
    critical: "oklch(0.72 0.22 25)",
  }[status]

  const text = {
    good: "text-emerald-300",
    warning: "text-amber-300",
    critical: "text-rose-300",
  }[status]

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((val - min) / range) * (height - 10) - 5
      return `${x},${y}`
    })
    .join(" ")
  const areaPoints = `0,${height} ${points} ${width},${height}`
  const gradId = `trend-${label.replace(/\s+/g, "")}`

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className={cn("text-sm font-bold tabular-nums", text)}>{value}</span>
      </div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon fill={`url(#${gradId})`} points={areaPoints} />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
        {data.map((val, i) => {
          if (i !== data.length - 1) return null
          const x = (i / (data.length - 1)) * width
          const y = height - ((val - min) / range) * (height - 10) - 5
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="5" fill={color} fillOpacity="0.25" />
              <circle cx={x} cy={y} r="2.5" fill={color} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
