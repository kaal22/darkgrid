import { useEffect, useState, useRef } from "react";
import { getThreatApiBase } from "@/lib/threatApi";

export interface ThreatIndicator {
  id: number;
  type: string;
  value: string;
  source: string;
  last_seen: string;
  severity: number | null;
  geo?: { country?: string } | null;
  tags?: string[] | null;
}

/**
 * Polls the DarkGrid / threat-intel backend for latest indicators and map buckets.
 * Set NEXT_PUBLIC_THREAT_API_URL to your backend (e.g. http://localhost:4000).
 */
export function useThreatDataPolling() {
  const [indicators, setIndicators] = useState<ThreatIndicator[]>([]);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const base = getThreatApiBase();
    if (!base) {
      setStatus("disconnected");
      return;
    }

    const fetchLatest = async () => {
      try {
        const res = await fetch(`${base}/api/indicators/latest?limit=50`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        setIndicators(data.items ?? []);
        setStatus("connected");
      } catch (e) {
        setStatus("disconnected");
      }
    };

    void fetchLatest();
    intervalRef.current = setInterval(fetchLatest, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { indicators, status };
}
