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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, 
  Users, 
  Phone, 
  Activity, 
  Target,
  Clock,
  TrendingUp,
  Gauge,
  Headphones,
  MessageSquare,
  BarChart3,
  Radio
} from "lucide-react"

function LiveIndicator() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
      </span>
      <span className="text-sm font-medium text-emerald-600">LIVE</span>
    </div>
  )
}

function CurrentTime() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-right">
      <p className="text-2xl font-bold tabular-nums">
        {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </p>
      <p className="text-xs text-muted-foreground">
        {time.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
      </p>
    </div>
  )
}

export default function CommandCenterPage() {
  const { agents, queues, liveCalls, sites, topics, metrics } = useLiveSimulation(3000)

  // Determine status colors based on metrics
  const fcrStatus = metrics.fcr >= metrics.fcrTarget ? "good" : metrics.fcr >= metrics.fcrTarget - 5 ? "warning" : "critical"
  const ahtStatus = metrics.aht <= metrics.ahtTarget ? "good" : metrics.aht <= metrics.ahtTarget + 1 ? "warning" : "critical"
  const csatStatus = metrics.csat >= metrics.csatTarget ? "good" : metrics.csat >= metrics.csatTarget - 0.3 ? "warning" : "critical"
  const slStatus = metrics.serviceLevel >= metrics.serviceLevelTarget ? "good" : metrics.serviceLevel >= metrics.serviceLevelTarget - 5 ? "warning" : "critical"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Contoso Bank</h1>
                <p className="text-xs text-muted-foreground">Command Center</p>
              </div>
            </div>
            <LiveIndicator />
          </div>
          <CurrentTime />
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Key Performance Gauges */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Real-Time Performance</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
            {/* Radial Gauges */}
            <Card className="col-span-2 md:col-span-1">
              <CardContent className="flex items-center justify-center py-4">
                <RadialGauge
                  value={metrics.fcr}
                  max={100}
                  label="First Call Resolution"
                  size="md"
                  colorScheme={fcrStatus === "good" ? "success" : fcrStatus === "warning" ? "warning" : "danger"}
                  showTrend
                  trend={metrics.fcrTrend}
                />
              </CardContent>
            </Card>
            
            <Card className="col-span-2 md:col-span-1">
              <CardContent className="flex items-center justify-center py-4">
                <RadialGauge
                  value={metrics.serviceLevel}
                  max={100}
                  label="Service Level"
                  size="md"
                  colorScheme={slStatus === "good" ? "success" : slStatus === "warning" ? "warning" : "danger"}
                  showTrend
                  trend={metrics.serviceLevel > metrics.serviceLevelTarget ? 1.5 : -2.1}
                />
              </CardContent>
            </Card>
            
            <Card className="col-span-2 md:col-span-1">
              <CardContent className="flex items-center justify-center py-4">
                <RadialGauge
                  value={metrics.csat * 20}
                  max={100}
                  label="CSAT Score"
                  unit=""
                  size="md"
                  colorScheme={csatStatus === "good" ? "success" : csatStatus === "warning" ? "warning" : "danger"}
                  showTrend
                  trend={metrics.csatTrend}
                />
              </CardContent>
            </Card>
            
            <Card className="col-span-2 md:col-span-1">
              <CardContent className="flex items-center justify-center py-4">
                <RadialGauge
                  value={metrics.nps}
                  max={100}
                  label="Net Promoter Score"
                  unit=""
                  size="md"
                  colorScheme={metrics.nps >= 50 ? "success" : metrics.nps >= 30 ? "warning" : "danger"}
                  showTrend
                  trend={metrics.npsTrend}
                />
              </CardContent>
            </Card>
            
            {/* Metric Cards */}
            <div className="col-span-2 xl:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <LiveMetricCard
                title="Active Agents"
                value={metrics.activeAgents}
                icon={<Users className="w-4 h-4 text-blue-500" />}
                status="good"
                trend={2}
              />
              <LiveMetricCard
                title="Calls in Queue"
                value={metrics.callsInQueue}
                icon={<Phone className="w-4 h-4 text-amber-500" />}
                status={metrics.callsInQueue > 30 ? "warning" : "good"}
                trend={metrics.callsInQueue > 20 ? 15 : -5}
              />
              <LiveMetricCard
                title="Avg Handle Time"
                value={metrics.aht}
                format="time"
                target={metrics.ahtTarget}
                icon={<Clock className="w-4 h-4 text-purple-500" />}
                status={ahtStatus}
                sparkline={metrics.ahtSparkline}
              />
              <LiveMetricCard
                title="Abandon Rate"
                value={metrics.abandonRate}
                format="percentage"
                icon={<Activity className="w-4 h-4 text-red-500" />}
                status={metrics.abandonRate > 5 ? "critical" : metrics.abandonRate > 3 ? "warning" : "good"}
                trend={metrics.abandonRate > 3 ? 8 : -12}
              />
            </div>
          </div>
        </section>

        {/* Summary Stats Bar */}
        <Card className="bg-muted/30">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Today&apos;s Performance:</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold tabular-nums">{metrics.callsHandledToday.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">calls handled</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold tabular-nums text-emerald-500">{metrics.fcr.toFixed(1)}%</span>
                  <span className="text-xs text-muted-foreground">FCR</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold tabular-nums">{Math.floor(metrics.avgWaitTime)}s</span>
                  <span className="text-xs text-muted-foreground">avg wait</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="gap-1">
                  <Radio className="w-3 h-3" />
                  {sites.length} Sites Active
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Headphones className="w-3 h-3" />
                  {agents.filter(a => a.status !== "offline").length} Agents Online
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview" className="gap-1.5">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-1.5">
              <Users className="w-4 h-4" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="queues" className="gap-1.5">
              <Phone className="w-4 h-4" />
              Queues
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Live Calls Feed */}
              <div className="lg:col-span-1">
                <LiveCallsFeed calls={liveCalls} />
              </div>
              
              {/* Queue Status */}
              <div className="lg:col-span-2">
                <QueueStatus queues={queues} />
              </div>
            </div>
            
            {/* Site Comparison */}
            <SiteComparison sites={sites} />
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <AgentStatusGrid agents={agents} />
          </TabsContent>

          <TabsContent value="queues" className="space-y-6">
            <QueueStatus queues={queues} />
            <div className="grid lg:grid-cols-2 gap-6">
              <TopicTrends topics={topics} />
              <LiveCallsFeed calls={liveCalls} title="Calls Needing Attention" />
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <TopicTrends topics={topics} />
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">FCR Trend (Last 12 intervals)</span>
                        <Badge variant={fcrStatus === "good" ? "default" : "destructive"}>
                          {metrics.fcr.toFixed(1)}%
                        </Badge>
                      </div>
                      <MiniChart data={metrics.fcrSparkline} color={fcrStatus === "good" ? "#10b981" : "#f59e0b"} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Service Level Trend</span>
                        <Badge variant={slStatus === "good" ? "default" : "destructive"}>
                          {metrics.serviceLevel.toFixed(1)}%
                        </Badge>
                      </div>
                      <MiniChart data={metrics.slSparkline} color={slStatus === "good" ? "#10b981" : "#f59e0b"} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">CSAT Trend</span>
                        <Badge variant={csatStatus === "good" ? "default" : "destructive"}>
                          {metrics.csat.toFixed(2)}
                        </Badge>
                      </div>
                      <MiniChart data={metrics.csatSparkline} color={csatStatus === "good" ? "#10b981" : "#f59e0b"} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <SiteComparison sites={sites} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const height = 50
  const width = 320
  
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((val - min) / range) * (height - 10) - 5
      return `${x},${y}`
    })
    .join(" ")

  const areaPoints = `0,${height} ${points} ${width},${height}`

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polygon
        fill={color}
        fillOpacity="0.1"
        points={areaPoints}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
      {data.map((val, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((val - min) / range) * (height - 10) - 5
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i === data.length - 1 ? 4 : 2}
            fill={color}
            opacity={i === data.length - 1 ? 1 : 0.5}
          />
        )
      })}
    </svg>
  )
}
