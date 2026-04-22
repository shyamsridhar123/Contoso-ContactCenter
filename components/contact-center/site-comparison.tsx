"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Building2, MapPin } from "lucide-react"

export interface SiteData {
  id: string
  name: string
  location: string
  type: "internal" | "bpo"
  agentsOnline: number
  agentsTotal: number
  callsHandled: number
  serviceLevel: number
  fcr: number
  aht: number
  csat: number
}

function SiteRow({ site }: { site: SiteData }) {
  const utilization = Math.round((site.agentsOnline / site.agentsTotal) * 100)
  const slStatus = site.serviceLevel >= 80 ? "good" : site.serviceLevel >= 70 ? "warning" : "critical"
  const fcrStatus = site.fcr >= 75 ? "good" : site.fcr >= 65 ? "warning" : "critical"
  
  const statusColors = {
    good: "text-emerald-500",
    warning: "text-amber-500",
    critical: "text-red-500",
  }

  return (
    <div className="grid grid-cols-8 gap-4 items-center py-3 px-4 border-b last:border-0 hover:bg-muted/50 transition-colors">
      <div className="col-span-2 flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          site.type === "internal" ? "bg-blue-500/10" : "bg-purple-500/10"
        )}>
          <Building2 className={cn(
            "w-4 h-4",
            site.type === "internal" ? "text-blue-500" : "text-purple-500"
          )} />
        </div>
        <div>
          <p className="font-medium text-sm">{site.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {site.location}
          </p>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm font-semibold tabular-nums">
          {site.agentsOnline}/{site.agentsTotal}
        </p>
        <Progress value={utilization} className="h-1 mt-1" />
      </div>
      
      <div className="text-center">
        <p className="text-sm font-semibold tabular-nums">{site.callsHandled}</p>
      </div>
      
      <div className="text-center">
        <p className={cn("text-sm font-semibold tabular-nums", statusColors[slStatus])}>
          {site.serviceLevel}%
        </p>
      </div>
      
      <div className="text-center">
        <p className={cn("text-sm font-semibold tabular-nums", statusColors[fcrStatus])}>
          {site.fcr}%
        </p>
      </div>
      
      <div className="text-center">
        <p className="text-sm font-semibold tabular-nums">
          {Math.floor(site.aht)}:{String(Math.round((site.aht % 1) * 60)).padStart(2, "0")}
        </p>
      </div>
      
      <div className="text-center">
        <p className={cn(
          "text-sm font-semibold tabular-nums",
          site.csat >= 4.5 ? "text-emerald-500" : site.csat >= 4.0 ? "text-amber-500" : "text-red-500"
        )}>
          {site.csat.toFixed(1)}
        </p>
      </div>
    </div>
  )
}

interface SiteComparisonProps {
  sites: SiteData[]
  title?: string
}

export function SiteComparison({ sites, title = "Site Performance" }: SiteComparisonProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-8 gap-4 items-center py-2 px-4 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
          <div className="col-span-2">Site</div>
          <div className="text-center">Agents</div>
          <div className="text-center">Calls</div>
          <div className="text-center">SL %</div>
          <div className="text-center">FCR %</div>
          <div className="text-center">AHT</div>
          <div className="text-center">CSAT</div>
        </div>
        <div className="max-h-[300px] overflow-auto">
          {sites.map((site) => (
            <SiteRow key={site.id} site={site} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
