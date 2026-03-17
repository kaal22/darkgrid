"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, AlertTriangle, Activity, Satellite, Cctv, ChevronDown, ChevronUp, Ship, Eye, Anchor, Settings, BookOpen, Radio, Play, Pause, Globe, Flame, Wifi, Server, Shield, ToggleLeft, ToggleRight, Palette } from "lucide-react";
import packageJson from "../../package.json";
import { useTheme } from "@/lib/ThemeContext";

function relativeTime(iso: string | undefined): string {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso + "Z").getTime();
    if (diff < 0) return "now";
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return `${Math.floor(hr / 24)}d ago`;
}

// Map layer IDs to freshness keys from the backend source_timestamps dict
const FRESHNESS_MAP: Record<string, string> = {
    flights: "commercial_flights",
    private: "private_flights",
    jets: "private_jets",
    military: "military_flights",
    tracked: "military_flights",
    earthquakes: "earthquakes",
    satellites: "satellites",
    ships_military: "ships",
    ships_cargo: "ships",
    ships_civilian: "ships",
    ships_passenger: "ships",
    ships_tracked_yachts: "ships",
    ukraine_frontline: "frontlines",
    global_incidents: "gdelt",
    cctv: "cctv",
    gps_jamming: "commercial_flights",
    kiwisdr: "kiwisdr",
    firms: "firms_fires",
    internet_outages: "internet_outages",
    datacenters: "datacenters",
};

// POTUS fleet ICAO hex codes for client-side filtering
const POTUS_ICAOS: Record<string, { label: string; type: string }> = {
    'ADFDF8': { label: 'Air Force One (82-8000)', type: 'AF1' },
    'ADFDF9': { label: 'Air Force One (92-9000)', type: 'AF1' },
    'ADFEB7': { label: 'Air Force Two (98-0001)', type: 'AF2' },
    'ADFEB8': { label: 'Air Force Two (98-0002)', type: 'AF2' },
    'ADFEB9': { label: 'Air Force Two (99-0003)', type: 'AF2' },
    'ADFEBA': { label: 'Air Force Two (99-0004)', type: 'AF2' },
    'AE4AE6': { label: 'Air Force Two (09-0015)', type: 'AF2' },
    'AE4AE8': { label: 'Air Force Two (09-0016)', type: 'AF2' },
    'AE4AEA': { label: 'Air Force Two (09-0017)', type: 'AF2' },
    'AE4AEC': { label: 'Air Force Two (19-0018)', type: 'AF2' },
    'AE0865': { label: 'Marine One (VH-3D)', type: 'M1' },
    'AE5E76': { label: 'Marine One (VH-92A)', type: 'M1' },
    'AE5E77': { label: 'Marine One (VH-92A)', type: 'M1' },
    'AE5E79': { label: 'Marine One (VH-92A)', type: 'M1' },
};
import type { DashboardData, ActiveLayers, SelectedEntity, KiwiSDR } from "@/types/dashboard";

const WorldviewLeftPanel = React.memo(function WorldviewLeftPanel({ data, activeLayers, setActiveLayers, threatCount = 0, onSettingsClick, onLegendClick, gibsDate, setGibsDate, gibsOpacity, setGibsOpacity, onEntityClick, onFlyTo, trackedSdr, setTrackedSdr }: { data: DashboardData; activeLayers: ActiveLayers; setActiveLayers: React.Dispatch<React.SetStateAction<ActiveLayers>>; threatCount?: number; onSettingsClick?: () => void; onLegendClick?: () => void; gibsDate?: string; setGibsDate?: (d: string) => void; gibsOpacity?: number; setGibsOpacity?: (o: number) => void; onEntityClick?: (entity: SelectedEntity) => void; onFlyTo?: (lat: number, lng: number) => void; trackedSdr?: KiwiSDR | null; setTrackedSdr?: (sdr: KiwiSDR | null) => void }) {
    const [isMinimized, setIsMinimized] = useState(false);
    const { theme, toggleTheme, hudColor, cycleHudColor } = useTheme();
    const [gibsPlaying, setGibsPlaying] = useState(false);
    const [potusEnabled, setPotusEnabled] = useState(true);
    const gibsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // GIBS time slider play/pause animation
    useEffect(() => {
        if (!gibsPlaying || !setGibsDate) {
            if (gibsIntervalRef.current) clearInterval(gibsIntervalRef.current);
            gibsIntervalRef.current = null;
            return;
        }
        gibsIntervalRef.current = setInterval(() => {
            if (!gibsDate) return;
            const d = new Date(gibsDate + 'T00:00:00');
            d.setDate(d.getDate() + 1);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (d > yesterday) {
                const start = new Date();
                start.setDate(start.getDate() - 30);
                setGibsDate(start.toISOString().slice(0, 10));
            } else {
                setGibsDate(d.toISOString().slice(0, 10));
            }
        }, 1500);
        return () => { if (gibsIntervalRef.current) clearInterval(gibsIntervalRef.current); };
    }, [gibsPlaying, gibsDate, setGibsDate]);

    // Compute ship category counts (memoized — ships array can be 1000+ items)
    const { militaryShipCount, cargoShipCount, passengerShipCount, civilianShipCount, trackedYachtCount } = useMemo(() => {
        const ships = data?.ships;
        if (!ships || !ships.length) return { militaryShipCount: 0, cargoShipCount: 0, passengerShipCount: 0, civilianShipCount: 0, trackedYachtCount: 0 };
        let military = 0, cargo = 0, passenger = 0, civilian = 0, trackedYacht = 0;
        for (const s of ships) {
            if (s.yacht_alert) { trackedYacht++; continue; }
            const t = s.type;
            if (t === 'carrier' || t === 'military_vessel') military++;
            else if (t === 'tanker' || t === 'cargo') cargo++;
            else if (t === 'passenger') passenger++;
            else civilian++;
        }
        return { militaryShipCount: military, cargoShipCount: cargo, passengerShipCount: passenger, civilianShipCount: civilian, trackedYachtCount: trackedYacht };
    }, [data?.ships]);

    // Find POTUS fleet planes currently airborne from tracked flights
    const potusFlights = useMemo(() => {
        const tracked = data?.tracked_flights;
        if (!tracked) return [];
        const results: { index: number; flight: any; meta: { label: string; type: string } }[] = [];
        for (let i = 0; i < tracked.length; i++) {
            const f = tracked[i];
            const icao = (f.icao24 || '').toUpperCase();
            if (POTUS_ICAOS[icao]) {
                results.push({ index: i, flight: f, meta: POTUS_ICAOS[icao] });
            }
        }
        return results;
    }, [data?.tracked_flights]);

    // OSINT data sources (one per line under Threat Indicators)
    const THREAT_SOURCES = ["AbuseIPDB", "OpenPhish"];

    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="w-full flex-1 min-h-0 flex flex-col pointer-events-none"
        >
            {/* Header */}
            <div className="mb-6 pointer-events-auto">
                <div className="text-[10px] text-[var(--text-secondary)] font-mono tracking-widest mb-1">THREAT INTEL</div>
                <div className="text-[10px] text-[var(--text-muted)] font-mono tracking-widest mb-4">OSINT FEED</div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-[0.2em] text-[var(--text-heading)]">DARKGRID</h1>
                    <button
                        onClick={cycleHudColor}
                        className={`w-7 h-7 rounded-lg border border-[var(--border-primary)] hover:border-cyan-500/50 flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-all hover:bg-[var(--hover-accent)]`}
                        title={hudColor === 'cyan' ? 'Switch to Matrix HUD' : 'Switch to Cyan HUD'}
                    >
                        <Palette size={14} />
                    </button>
                    {onSettingsClick && (
                        <button
                            onClick={onSettingsClick}
                            className={`w-7 h-7 rounded-lg border border-[var(--border-primary)] hover:border-cyan-500/50 flex items-center justify-center ${theme === 'dark' ? 'text-cyan-400' : 'text-[var(--text-muted)]'} hover:text-cyan-300 transition-all hover:bg-[var(--hover-accent)] group`}
                            title="System Settings"
                        >
                            <Settings size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    )}
                    {onLegendClick && (
                        <button
                            onClick={onLegendClick}
                            className={`h-7 px-2 rounded-lg border border-[var(--border-primary)] hover:border-cyan-500/50 flex items-center justify-center gap-1 ${theme === 'dark' ? 'text-cyan-400' : 'text-[var(--text-muted)]'} hover:text-cyan-300 transition-all hover:bg-[var(--hover-accent)]`}
                            title="Map Legend / Icon Key"
                        >
                            <BookOpen size={12} />
                            <span className="text-[8px] font-mono tracking-widest font-bold">KEY</span>
                        </button>
                    )}
                    <span className={`h-7 px-2 rounded-lg border border-[var(--border-primary)] flex items-center justify-center text-[8px] ${theme === 'dark' ? 'text-cyan-400' : 'text-[var(--text-muted)]'} font-mono tracking-widest select-none`}>
                        v{packageJson.version}
                    </span>
                </div>
            </div>

            {/* Data Layers Box */}
            <div className="bg-[var(--bg-primary)]/40 backdrop-blur-md border border-[var(--border-primary)] rounded-xl pointer-events-auto shadow-[0_4px_30px_rgba(0,0,0,0.2)] flex flex-col relative overflow-hidden max-h-full">

                {/* Header / Toggle */}
                <div
                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-[var(--bg-secondary)]/50 transition-colors border-b border-[var(--border-primary)]/50"
                >
                    <span className="text-[10px] text-[var(--text-muted)] font-mono tracking-widest" onClick={() => setIsMinimized(!isMinimized)}>DATA LAYERS</span>
                    <div className="flex items-center gap-2">
                        <button
                            title={Object.entries(activeLayers).filter(([k]) => k !== 'gibs_imagery').every(([, v]) => v) ? "Disable all layers" : "Enable all layers"}
                            className={`${Object.entries(activeLayers).filter(([k]) => k !== 'gibs_imagery').every(([, v]) => v) ? 'text-cyan-400' : 'text-[var(--text-muted)]'} hover:text-cyan-400 transition-colors`}
                            onClick={(e) => {
                                e.stopPropagation();
                                const allOn = Object.entries(activeLayers).filter(([k]) => k !== 'gibs_imagery').every(([, v]) => v);
                                setActiveLayers((prev: any) => {
                                    const next: any = {};
                                    for (const k of Object.keys(prev)) {
                                        next[k] = k === 'gibs_imagery' ? false : !allOn;
                                    }
                                    return next;
                                });
                            }}
                        >
                            {Object.entries(activeLayers).filter(([k]) => k !== 'gibs_imagery').every(([, v]) => v) ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" onClick={() => setIsMinimized(!isMinimized)}>
                            {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {!isMinimized && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-y-auto styled-scrollbar"
                        >
                            <div className="flex flex-col gap-6 p-4 pt-2 pb-6">
                                {/* SDR TRACKER — pinned to TOP when active */}
                                {trackedSdr && (
                                    <div className="bg-amber-950/20 border border-amber-500/40 rounded-lg p-3 -mt-1 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Radio size={14} className="text-amber-400" />
                                                <span className="text-[10px] text-amber-400 font-mono tracking-widest font-bold">SDR TRACKER</span>
                                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 animate-pulse">
                                                    LIVE
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setTrackedSdr?.(null); }}
                                                className="text-[8px] font-mono text-[var(--text-muted)] hover:text-red-400 border border-[var(--border-primary)] hover:border-red-400/40 rounded px-1.5 py-0.5 transition-colors"
                                                title="Release SDR and clear tracking"
                                            >
                                                RELEASE
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-col p-2 rounded-lg border border-amber-500/20 bg-amber-950/10">
                                                <span className="text-[10px] font-bold font-mono text-amber-300 truncate mb-1">
                                                    {(trackedSdr.name || 'REMOTE RECEIVER').toUpperCase()}
                                                </span>
                                                <div className="text-[8px] text-[var(--text-muted)] font-mono mb-2">
                                                    {trackedSdr.location && <span>{trackedSdr.location} · </span>}
                                                    {trackedSdr.antenna && <span>{trackedSdr.antenna.slice(0, 40)}</span>}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <button
                                                        onClick={() => onFlyTo?.(trackedSdr.lat, trackedSdr.lon)}
                                                        className="flex-1 text-center px-2 py-1.5 rounded border border-[var(--border-primary)] hover:border-amber-400/50 hover:text-amber-400 text-[var(--text-muted)] text-[9px] font-mono tracking-widest transition-colors flex items-center justify-center gap-1.5"
                                                        title="Pan camera to SDR location"
                                                    >
                                                        <Globe size={10} /> RE-LOCK
                                                    </button>
                                                    {trackedSdr.url && (
                                                        <a
                                                            href={trackedSdr.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-1 text-center px-2 py-1.5 rounded border border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:border-amber-400 text-[9px] font-mono tracking-widest transition-colors flex items-center justify-center gap-1.5"
                                                        >
                                                            <Activity size={10} /> TUNER
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Threat Indicators — sources listed one per line */}
                                <div className="flex flex-col">
                                    <div className="flex items-start justify-between group">
                                        <div className="flex gap-3">
                                            <div className="mt-1 text-cyan-400">
                                                <Shield size={16} strokeWidth={1.5} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-[var(--text-primary)] tracking-wide">Threat Indicators</span>
                                                <span className="text-[9px] text-[var(--text-muted)] font-mono tracking-wider mt-0.5">LIVE</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {(threatCount ?? 0) > 0 && (
                                                <span className="text-[10px] text-gray-300 font-mono">{(threatCount ?? 0).toLocaleString()}</span>
                                            )}
                                            <div className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full border border-cyan-500/50 text-cyan-400 bg-cyan-950/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                                                ON
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-7 mt-2 flex flex-col gap-0.5">
                                        {THREAT_SOURCES.map((source) => (
                                            <span key={source} className="text-[10px] font-mono text-[var(--text-muted)] tracking-wider">
                                                {source}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
});

export default WorldviewLeftPanel;
