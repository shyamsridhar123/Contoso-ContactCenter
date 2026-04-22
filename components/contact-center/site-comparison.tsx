"use client"

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

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 rounded-full bg-white/5 overflow-hidden mt-1">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${Math.min(value, 100)}%`,
          background: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
    </div>
  )
}

function SiteRow({ site }: { site: SiteData }) {
  const utilization = Math.round((site.agentsOnline / site.agentsTotal) * 100)
  const slStatus = site.serviceLevel >= 80 ? "good" : site.serviceLevel >= 70 ? "warning" : "critical"
  const fcrStatus = site.fcr >= 75 ? "good" : site.fcr >= 65 ? "warning" : "critical"

  const statusColors = {
    good: "text-emerald-300",
    warning: "text-amber-300",
    critical: "text-rose-300",
  }

  const typeCfg =
    site.type === "internal"
      ? { text: "text-sky-300", bg: "bg-sky-400/10", border: "border-sky-400/20", label: "HQ" }
      : { text: "text-cyan-300", bg: "bg-cyan-400/10", border: "border-cyan-400/20", label: "BPO" }

  return (
    <div className="grid grid-cols-8 gap-4 items-center py-3 px-5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
      <div className="col-span-2 flex items-center gap-3">
        <div className={cn("p-2 rounded-lg border glass-subtle", typeCfg.border)}>
          <Building2 className={cn("w-3.5 h-3.5", typeCfg.text)} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-xs truncate">{site.name}</p>
            <span
              className={cn(
                "px-1 py-0 rounded text-[9px] font-semibold uppercase tracking-wider border",
                typeCfg.bg,
                typeCfg.text,
                typeCfg.border,
              )}
            >
              {typeCfg.label}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-2.5 h-2.5" />
            {site.location}
          </p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold tabular-nums">
          {site.agentsOnline}
          <span className="text-muted-foreground">/{site.agentsTotal}</span>
        </p>
        <MiniBar value={utilization} color="oklch(0.78 0.15 210)" />
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold tabular-nums">{site.callsHandled.toLocaleString()}</p>
      </div>

      <div className="text-center">
        <p className={cn("text-xs font-semibold tabular-nums", statusColors[slStatus])}>
          {site.serviceLevel}%
        </p>
      </div>

      <div className="text-center">
        <p className={cn("text-xs font-semibold tabular-nums", statusColors[fcrStatus])}>
          {site.fcr}%
        </p>
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold tabular-nums">
          {Math.floor(site.aht)}:{String(Math.round((site.aht % 1) * 60)).padStart(2, "0")}
        </p>
      </div>

      <div className="text-center">
        <p
          className={cn(
            "text-xs font-semibold tabular-nums",
            site.csat >= 4.5 ? "text-emerald-300" : site.csat >= 4.0 ? "text-amber-300" : "text-rose-300",
          )}
        >
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
    <div className="rounded-2xl glass overflow-hidden">
      <div className="flex items-center justify-between p-5 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg glass-subtle">
            <Building2 className="w-4 h-4 text-sky-300" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {sites.length} sites
        </p>
      </div>

      <div className="grid grid-cols-8 gap-4 items-center py-2 px-5 bg-white/[0.02] border-y border-white/5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="col-span-2">Site</div>
        <div className="text-center">Agents</div>
        <div className="text-center">Calls</div>
        <div className="text-center">SL</div>
        <div className="text-center">FCR</div>
        <div className="text-center">AHT</div>
        <div className="text-center">CSAT</div>
      </div>

      <div className="max-h-[340px] overflow-auto scrollbar-thin">
        {sites.map((site) => (
          <SiteRow key={site.id} site={site} />
        ))}
      </div>
    </div>
  )
}
