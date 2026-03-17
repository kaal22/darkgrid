"use client";

import React from "react";
import type { ThreatIndicator } from "@/hooks/useThreatDataPolling";

interface ThreatFeedProps {
  indicators: ThreatIndicator[];
  status: "connecting" | "connected" | "disconnected";
  onSelectIndicator?: (value: string) => void;
}

export default function ThreatFeed({ indicators, status, onSelectIndicator }: ThreatFeedProps) {
  return (
    <div className="flex flex-col gap-2 flex-shrink-0">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono tracking-[0.2em] text-cyan-500">THREAT FEED</span>
        <span
          className={`text-[8px] font-mono ${
            status === "connected"
              ? "text-green-400"
              : status === "connecting"
                ? "text-yellow-400"
                : "text-red-400"
          }`}
        >
          {status === "connected" ? "LIVE" : status === "connecting" ? "…" : "OFFLINE"}
        </span>
      </div>
      <div className="bg-[var(--bg-primary)]/60 backdrop-blur border border-[var(--border-primary)] rounded-lg overflow-hidden max-h-[280px] overflow-y-auto styled-scrollbar">
        <ul className="divide-y divide-[var(--border-primary)]/50">
          {indicators.length === 0 && status === "connected" && (
            <li className="px-3 py-4 text-[9px] text-[var(--text-muted)] font-mono">
              No indicators yet. Run ingestion on your backend.
            </li>
          )}
          {indicators.slice(0, 50).map((ind) => (
            <li
              key={`${ind.type}-${ind.value}-${ind.id}`}
              className="px-3 py-2 hover:bg-cyan-950/30 transition-colors cursor-pointer border-b border-[var(--border-primary)]/30 last:border-0"
              onClick={() => onSelectIndicator?.(ind.value)}
              onKeyDown={(e) => e.key === "Enter" && onSelectIndicator?.(ind.value)}
              role="button"
              tabIndex={0}
            >
              <div className="flex justify-between items-center gap-2">
                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider">
                  {ind.type}
                </span>
                <span className="text-[8px] text-[var(--text-muted)]">{ind.source}</span>
              </div>
              <div className="text-[10px] font-mono text-[var(--text-primary)] truncate mt-0.5">
                {ind.value}
              </div>
              <div className="flex justify-between mt-1 text-[8px] text-[var(--text-muted)]">
                <span>{ind.geo?.country ?? "—"}</span>
                <span>{new Date(ind.last_seen).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
