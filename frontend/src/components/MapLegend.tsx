"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";

// ─── Inline SVG legend icons (small, crisp, no external deps) ───
const plane = (fill: string, size = 16) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="black"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" /></svg>`;

const airliner = (fill: string, size = 16) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="black"><path d="M12 2C11.2 2 10.5 2.8 10.5 3.5V8.5L3 13V15L10.5 12.5V18L8 19.5V21L12 19.5L16 21V19.5L13.5 18V12.5L21 15V13L13.5 8.5V3.5C13.5 2.8 12.8 2 12 2Z M5.5 13.5L3.5 14.5 M18.5 13.5L20.5 14.5"/><circle cx="7" cy="12.5" r="1.2" fill="${fill}" stroke="black" stroke-width="0.5"/><circle cx="17" cy="12.5" r="1.2" fill="${fill}" stroke="black" stroke-width="0.5"/></svg>`;

const turboprop = (fill: string, size = 16) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="black"><path d="M12 3C11.3 3 10.8 3.5 10.8 4V9L3 12V13.5L10.8 11.5V18.5L9 19.5V21L12 20L15 21V19.5L13.2 18.5V11.5L21 13.5V12L13.2 9V4C13.2 3.5 12.7 3 12 3Z"/></svg>`;

const bizjet = (fill: string, size = 16) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="black"><path d="M12 1.5C11.4 1.5 11 2 11 2.8V9L5 12.5V14L11 12V18.5L8.5 20V21.5L12 20.5L15.5 21.5V20L13 18.5V12L19 14V12.5L13 9V2.8C13 2 12.6 1.5 12 1.5Z"/></svg>`;

const heli = (fill: string, size = 16) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="black"><path d="M10 6L10 14L8 16L8 18L10 17L12 22L14 17L16 18L16 16L14 14L14 6C14 4 13 2 12 2C11 2 10 4 10 6Z"/><circle cx="12" cy="12" r="8" fill="none" stroke="${fill}" stroke-dasharray="2 2" stroke-width="1"/></svg>`;

const ship = (fill: string, size = 16) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><path d="M6 22 L6 6 L12 2 L18 6 L18 22 Z" fill="${fill}" stroke="#000" stroke-width="1"/></svg>`;

const triangle = (fill: string, size = 16) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="#000" stroke-width="1"><path d="M1 21h22L12 2 1 21z"/></svg>`;

const circle = (fill: string, size = 16) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="${fill}" stroke="#000" stroke-width="1"/></svg>`;

const dot = (fill: string, size = 16) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="${fill}" stroke="#000" stroke-width="1"/></svg>`;

function IconImg({ svg }: { svg: string }) {
    return <img src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} alt="" className="w-4 h-4 flex-shrink-0" draggable={false} />;
}

// ─── Legend data ───

interface LegendItem {
    svg: string;
    label: string;
}

interface LegendCategory {
    name: string;
    color: string;
    items: LegendItem[];
}

const sat = (fill: string, size = 16) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${fill}" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="8" fill="none" stroke="${fill}" stroke-dasharray="3 3" stroke-width="0.8"/></svg>`;

const square = (fill: string, size = 16) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" fill="${fill}" stroke="#000" stroke-width="1" opacity="0.6" rx="2"/></svg>`;

const clusterCircle = (fill: string, stroke: string, size = 16) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="${fill}" stroke="${stroke}" stroke-width="2" opacity="0.8"/><text x="12" y="15" text-anchor="middle" fill="white" font-size="8" font-family="monospace" font-weight="bold">5</text></svg>`;

// OSINT / threat dashboard legend only
const LEGEND: LegendCategory[] = [
    {
        name: "THREAT INDICATORS",
        color: "text-cyan-400 border-cyan-500/30",
        items: [
            { svg: circle("#22c55e"), label: "IP address (AbuseIPDB — abuse / malicious)" },
            { svg: circle("#ef4444"), label: "Phishing URL (OpenPhish feed)" },
            { svg: dot("#06b6d4"), label: "Indicator on globe (click for details)" },
        ],
    },
    {
        name: "THREAT PINGS (GLOBE)",
        color: "text-red-400 border-red-500/40",
        items: [
            { svg: dot("#22d3ee"), label: "Low activity · few indicators mapped to this country" },
            { svg: dot("#fbbf24"), label: "Elevated activity · dozens of indicators" },
            { svg: dot("#fb7185"), label: "High activity · 100+ indicators (hot spot)" },
        ],
    },
    {
        name: "OVERLAYS",
        color: "text-gray-400 border-gray-500/30",
        items: [
            { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><rect width="24" height="24" fill="#0a0e1a" opacity="0.4"/><circle cx="12" cy="12" r="4" fill="#ffd700"/></svg>`, label: "Day / Night terminator" },
        ],
    },
];

const MapLegend = React.memo(function MapLegend({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

    const toggle = (name: string) => {
        setCollapsed(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
                        onClick={onClose}
                    />

                    {/* Legend Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] max-h-[80vh] bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-cyan-900/50 rounded-xl z-[9999] flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.3)]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-[var(--border-primary)]/80 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="cyan" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <path d="M12 3v12" />
                                        <path d="m8 11 4 4 4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold tracking-[0.2em] text-[var(--text-primary)] font-mono">MAP LEGEND</h2>
                                    <span className="text-[9px] text-[var(--text-muted)] font-mono tracking-widest">ICON REFERENCE KEY</span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg border border-[var(--border-primary)] hover:border-red-500/50 flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 transition-all hover:bg-red-950/20"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Legend Content */}
                        <div className="flex-1 overflow-y-auto styled-scrollbar p-4 space-y-2">
                            {LEGEND.map((cat) => {
                                const isCollapsed = collapsed.has(cat.name);
                                return (
                                    <div key={cat.name} className="rounded-lg border border-[var(--border-primary)]/60 overflow-hidden">
                                        {/* Category Header */}
                                        <button
                                            onClick={() => toggle(cat.name)}
                                            className="w-full flex items-center justify-between px-3 py-2 bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)]/80 transition-colors"
                                        >
                                            <span className={`text-[9px] font-mono tracking-widest font-bold px-2 py-0.5 rounded border ${cat.color}`}>
                                                {cat.name}
                                            </span>
                                            {isCollapsed ? <ChevronDown size={12} className="text-[var(--text-muted)]" /> : <ChevronUp size={12} className="text-[var(--text-muted)]" />}
                                        </button>

                                        {/* Items */}
                                        <AnimatePresence>
                                            {!isCollapsed && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="border-t border-[var(--border-primary)]/40"
                                                >
                                                    <div className="grid grid-cols-1 gap-0">
                                                        {cat.items.map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-3 px-4 py-1.5 hover:bg-[var(--bg-secondary)]/30 transition-colors">
                                                                <IconImg svg={item.svg} />
                                                                <span className="text-[11px] text-[var(--text-secondary)] font-mono">{item.label}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-[var(--border-primary)]/80 flex-shrink-0">
                            <div className="text-[9px] text-[var(--text-muted)] font-mono text-center tracking-wider">
                                {LEGEND.reduce((sum, c) => sum + c.items.length, 0)} ICON DEFINITIONS ACROSS {LEGEND.length} CATEGORIES
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
});

export default MapLegend;
