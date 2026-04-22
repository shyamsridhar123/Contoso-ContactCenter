"use client"

import { useState, useEffect, useCallback } from "react"
import type { Agent } from "@/components/contact-center/agent-status-grid"
import type { QueueData } from "@/components/contact-center/queue-status"
import type { LiveCall } from "@/components/contact-center/live-calls-feed"
import type { SiteData } from "@/components/contact-center/site-comparison"
import type { TopicData } from "@/components/contact-center/topic-trends"

// Helper functions
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1))
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// Initial data generators
const agentNames = [
  { name: "Sarah Johnson", initials: "SJ" },
  { name: "Michael Chen", initials: "MC" },
  { name: "Emily Davis", initials: "ED" },
  { name: "David Wilson", initials: "DW" },
  { name: "Jessica Brown", initials: "JB" },
  { name: "Robert Taylor", initials: "RT" },
  { name: "Amanda Martinez", initials: "AM" },
  { name: "James Anderson", initials: "JA" },
  { name: "Lisa Thompson", initials: "LT" },
  { name: "Kevin Garcia", initials: "KG" },
  { name: "Rachel Lee", initials: "RL" },
  { name: "Thomas White", initials: "TW" },
  { name: "Maria Rodriguez", initials: "MR" },
  { name: "Christopher Moore", initials: "CM" },
  { name: "Jennifer Clark", initials: "JC" },
  { name: "Daniel Lewis", initials: "DL" },
]

const queueNames = [
  "Credit Cards",
  "Fraud Detection",
  "Mortgage Services",
  "Retail Banking",
  "Collections",
  "Wealth Management",
]

const topics = [
  "Card Activation",
  "Disputed Transaction",
  "Payment Issues",
  "Account Balance",
  "Fraud Alert",
  "Loan Inquiry",
  "Wire Transfer",
  "Account Closure",
  "Fee Dispute",
  "Password Reset",
]

const transcriptPreviews = [
  "I understand your concern about the charge...",
  "Let me verify your account details first...",
  "I can see the transaction was processed on...",
  "Thank you for your patience while I look into this...",
  "I apologize for the inconvenience this has caused...",
  "I'm going to escalate this to our fraud team...",
  "Your new card should arrive within 5-7 business days...",
  "I can see the payment was returned due to...",
]

const customerTypes = ["Retail", "Premium", "Small Business", "Wealth", "Corporate"]

function generateInitialAgents(): Agent[] {
  return agentNames.map((agent, i) => {
    const statuses: Agent["status"][] = ["on-call", "on-call", "on-call", "available", "wrap-up", "break", "offline"]
    const status = pickRandom(statuses)
    const sentiments: Agent["sentiment"][] = ["positive", "positive", "neutral", "neutral", "negative"]
    
    return {
      id: `agent-${i}`,
      name: agent.name,
      initials: agent.initials,
      status,
      currentDuration: status === "on-call" ? formatDuration(randomInt(30, 600)) : status === "wrap-up" ? formatDuration(randomInt(10, 120)) : undefined,
      sentiment: status === "on-call" ? pickRandom(sentiments) : undefined,
      queue: status !== "offline" && status !== "break" ? pickRandom(queueNames) : undefined,
      callsHandled: randomInt(5, 25),
      aht: randomBetween(4, 8),
      fcr: randomInt(70, 95),
    }
  })
}

function generateInitialQueues(): QueueData[] {
  return queueNames.map((name, i) => ({
    id: `queue-${i}`,
    name,
    waitingCalls: randomInt(0, 12),
    avgWaitTime: randomInt(15, 180),
    longestWait: randomInt(30, 300),
    agentsAvailable: randomInt(2, 8),
    agentsOnCall: randomInt(5, 15),
    serviceLevel: randomInt(65, 95),
    serviceLevelTarget: 80,
    abandoned: randomInt(2, 20),
    answered: randomInt(50, 200),
  }))
}

function generateInitialCalls(agents: Agent[]): LiveCall[] {
  const onCallAgents = agents.filter((a) => a.status === "on-call")
  return onCallAgents.slice(0, 8).map((agent, i) => {
    const sentiment = agent.sentiment || "neutral"
    const flags: string[] = []
    if (sentiment === "negative" && Math.random() > 0.5) flags.push("Escalation Risk")
    if (Math.random() > 0.85) flags.push("Compliance Flag")
    
    return {
      id: `call-${i}`,
      agentName: agent.name,
      agentInitials: agent.initials,
      customerType: pickRandom(customerTypes),
      queue: agent.queue || "General",
      duration: agent.currentDuration || "0:00",
      sentiment,
      sentimentTrend: pickRandom(["improving", "stable", "declining"]) as LiveCall["sentimentTrend"],
      topic: pickRandom(topics),
      flags,
      transcriptPreview: Math.random() > 0.5 ? pickRandom(transcriptPreviews) : undefined,
    }
  })
}

function generateInitialSites(): SiteData[] {
  const sites = [
    { name: "Phoenix HQ", location: "Phoenix, AZ", type: "internal" as const },
    { name: "Tampa Center", location: "Tampa, FL", type: "internal" as const },
    { name: "Manila BPO", location: "Manila, PH", type: "bpo" as const },
    { name: "Bangalore BPO", location: "Bangalore, IN", type: "bpo" as const },
    { name: "Dublin Center", location: "Dublin, IE", type: "internal" as const },
    { name: "Costa Rica BPO", location: "San Jose, CR", type: "bpo" as const },
  ]
  
  return sites.map((site, i) => ({
    id: `site-${i}`,
    ...site,
    agentsOnline: randomInt(40, 120),
    agentsTotal: randomInt(80, 150),
    callsHandled: randomInt(200, 800),
    serviceLevel: randomInt(72, 92),
    fcr: randomInt(68, 88),
    aht: randomBetween(5, 8),
    csat: randomBetween(3.8, 4.8),
  }))
}

function generateInitialTopics(): TopicData[] {
  const topicData = [
    { name: "Fraud Alert", baseVolume: 180, isSpike: true },
    { name: "Card Activation", baseVolume: 150, isSpike: false },
    { name: "Balance Inquiry", baseVolume: 120, isSpike: false },
    { name: "Payment Issues", baseVolume: 95, isSpike: false },
    { name: "Fee Dispute", baseVolume: 78, isSpike: true },
    { name: "Account Closure", baseVolume: 45, isSpike: false },
    { name: "Wire Transfer", baseVolume: 38, isSpike: false },
    { name: "Loan Inquiry", baseVolume: 32, isSpike: false },
  ]
  
  return topicData.map((topic, i) => ({
    id: `topic-${i}`,
    name: topic.name,
    volume: topic.baseVolume + randomInt(-20, 20),
    percentChange: topic.isSpike ? randomInt(25, 85) : randomInt(-15, 25),
    sentiment: pickRandom(["positive", "neutral", "negative"]) as TopicData["sentiment"],
    isSpike: topic.isSpike,
  }))
}

// Metrics type
export interface Metrics {
  fcr: number
  fcrTarget: number
  fcrTrend: number
  aht: number
  ahtTarget: number
  ahtTrend: number
  csat: number
  csatTarget: number
  csatTrend: number
  serviceLevel: number
  serviceLevelTarget: number
  nps: number
  npsTrend: number
  activeAgents: number
  totalCalls: number
  callsInQueue: number
  abandonRate: number
  callsHandledToday: number
  avgWaitTime: number
  fcrSparkline: number[]
  ahtSparkline: number[]
  csatSparkline: number[]
  slSparkline: number[]
}

function generateInitialMetrics(): Metrics {
  return {
    fcr: 78.5,
    fcrTarget: 80,
    fcrTrend: 2.3,
    aht: 6.45,
    ahtTarget: 6,
    ahtTrend: -1.2,
    csat: 4.32,
    csatTarget: 4.5,
    csatTrend: 0.8,
    serviceLevel: 82.1,
    serviceLevelTarget: 80,
    nps: 45,
    npsTrend: 3,
    activeAgents: 89,
    totalCalls: 156,
    callsInQueue: 23,
    abandonRate: 3.2,
    callsHandledToday: 2847,
    avgWaitTime: 45,
    fcrSparkline: Array.from({ length: 12 }, () => randomBetween(75, 85)),
    ahtSparkline: Array.from({ length: 12 }, () => randomBetween(5.5, 7.5)),
    csatSparkline: Array.from({ length: 12 }, () => randomBetween(4.0, 4.6)),
    slSparkline: Array.from({ length: 12 }, () => randomBetween(75, 90)),
  }
}

// Main hook
export function useLiveSimulation(updateInterval = 3000) {
  const [agents, setAgents] = useState<Agent[]>(() => generateInitialAgents())
  const [queues, setQueues] = useState<QueueData[]>(() => generateInitialQueues())
  const [liveCalls, setLiveCalls] = useState<LiveCall[]>(() => generateInitialCalls(generateInitialAgents()))
  const [sites, setSites] = useState<SiteData[]>(() => generateInitialSites())
  const [topics, setTopics] = useState<TopicData[]>(() => generateInitialTopics())
  const [metrics, setMetrics] = useState<Metrics>(() => generateInitialMetrics())

  const updateSimulation = useCallback(() => {
    // Update agents
    setAgents((prev) =>
      prev.map((agent) => {
        // Randomly change some agent states
        if (Math.random() > 0.85) {
          const newStatuses: Agent["status"][] = ["on-call", "available", "wrap-up"]
          const newStatus = pickRandom(newStatuses)
          return {
            ...agent,
            status: newStatus,
            currentDuration: newStatus === "on-call" ? "0:00" : undefined,
            sentiment: newStatus === "on-call" ? pickRandom(["positive", "neutral", "negative"]) : undefined,
            callsHandled: newStatus === "wrap-up" ? agent.callsHandled + 1 : agent.callsHandled,
          }
        }
        // Update call duration
        if (agent.status === "on-call" && agent.currentDuration) {
          const [mins, secs] = agent.currentDuration.split(":").map(Number)
          const totalSecs = mins * 60 + secs + 3
          return { ...agent, currentDuration: formatDuration(totalSecs) }
        }
        return agent
      })
    )

    // Update queues
    setQueues((prev) =>
      prev.map((queue) => ({
        ...queue,
        waitingCalls: Math.max(0, queue.waitingCalls + randomInt(-2, 3)),
        avgWaitTime: Math.max(10, queue.avgWaitTime + randomInt(-10, 15)),
        longestWait: Math.max(queue.avgWaitTime, queue.longestWait + randomInt(-20, 30)),
        serviceLevel: Math.min(100, Math.max(50, queue.serviceLevel + randomBetween(-2, 2))),
        answered: queue.answered + randomInt(0, 5),
        abandoned: queue.abandoned + (Math.random() > 0.9 ? 1 : 0),
      }))
    )

    // Update live calls
    setLiveCalls((prev) =>
      prev.map((call) => {
        const [mins, secs] = call.duration.split(":").map(Number)
        const totalSecs = mins * 60 + secs + 3
        const newSentiment = Math.random() > 0.95 
          ? pickRandom(["positive", "neutral", "negative"]) as LiveCall["sentiment"]
          : call.sentiment
        
        return {
          ...call,
          duration: formatDuration(totalSecs),
          sentiment: newSentiment,
          sentimentTrend: Math.random() > 0.9 
            ? pickRandom(["improving", "stable", "declining"]) as LiveCall["sentimentTrend"]
            : call.sentimentTrend,
        }
      })
    )

    // Update sites
    setSites((prev) =>
      prev.map((site) => ({
        ...site,
        callsHandled: site.callsHandled + randomInt(1, 8),
        serviceLevel: Math.min(100, Math.max(60, site.serviceLevel + randomBetween(-1, 1))),
        fcr: Math.min(100, Math.max(60, site.fcr + randomBetween(-0.5, 0.5))),
        csat: Math.min(5, Math.max(3.5, site.csat + randomBetween(-0.05, 0.05))),
      }))
    )

    // Update topics
    setTopics((prev) =>
      prev.map((topic) => ({
        ...topic,
        volume: Math.max(10, topic.volume + randomInt(-5, 8)),
        percentChange: Math.max(-30, Math.min(100, topic.percentChange + randomInt(-3, 5))),
      }))
    )

    // Update metrics
    setMetrics((prev) => {
      const newFcr = Math.min(100, Math.max(60, prev.fcr + randomBetween(-0.5, 0.8)))
      const newAht = Math.max(4, Math.min(10, prev.aht + randomBetween(-0.1, 0.15)))
      const newCsat = Math.max(3.5, Math.min(5, prev.csat + randomBetween(-0.03, 0.05)))
      const newSl = Math.min(100, Math.max(60, prev.serviceLevel + randomBetween(-1, 1.5)))
      
      return {
        ...prev,
        fcr: newFcr,
        aht: newAht,
        csat: newCsat,
        serviceLevel: newSl,
        nps: Math.min(100, Math.max(-100, prev.nps + randomInt(-2, 3))),
        activeAgents: Math.max(50, Math.min(120, prev.activeAgents + randomInt(-2, 2))),
        totalCalls: Math.max(100, prev.totalCalls + randomInt(-5, 10)),
        callsInQueue: Math.max(0, prev.callsInQueue + randomInt(-3, 5)),
        abandonRate: Math.max(0, Math.min(10, prev.abandonRate + randomBetween(-0.2, 0.3))),
        callsHandledToday: prev.callsHandledToday + randomInt(1, 5),
        avgWaitTime: Math.max(10, Math.min(180, prev.avgWaitTime + randomInt(-5, 8))),
        fcrSparkline: [...prev.fcrSparkline.slice(1), newFcr],
        ahtSparkline: [...prev.ahtSparkline.slice(1), newAht],
        csatSparkline: [...prev.csatSparkline.slice(1), newCsat],
        slSparkline: [...prev.slSparkline.slice(1), newSl],
      }
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(updateSimulation, updateInterval)
    return () => clearInterval(interval)
  }, [updateSimulation, updateInterval])

  return {
    agents,
    queues,
    liveCalls,
    sites,
    topics,
    metrics,
  }
}
