"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Filter, Shield, SlidersHorizontal, AlertTriangle, Database } from "lucide-react";
import AdvancedFilterModal from "./AdvancedFilterModal";

interface FilterPanelProps {
    data: any;
    activeFilters: Record<string, string[]>;
    setActiveFilters: (filters: Record<string, string[]>) => void;
}

type ModalConfig = {
    title: string;
    icon: React.ReactNode;
    accentColor: string;
    accentColorName: string;
    fields: { key: string; label: string; options: string[]; optionLabels?: Record<string, string> }[];
};

const INDICATOR_TYPES = ["ip", "url"];
const SOURCES = ["abuseipdb", "openphish"];
const SEVERITIES = ["low", "medium", "high"];
const severityLabels: Record<string, string> = { low: "Low (1)", medium: "Medium (2)", high: "High (3)" };

export default function FilterPanel({ activeFilters, setActiveFilters }: FilterPanelProps) {
    const [isMinimized, setIsMinimized] = useState(true);
    const [openModal, setOpenModal] = useState<string | null>(null);

    const modalConfigs: Record<string, ModalConfig> = {
        type: {
            title: "INDICATOR TYPE",
            icon: <AlertTriangle size={13} className="text-cyan-400" />,
            accentColor: "#06b6d4",
            accentColorName: "cyan",
            fields: [
                { key: "indicator_type", label: "TYPE", options: INDICATOR_TYPES },
            ]
        },
        source: {
            title: "SOURCE",
            icon: <Database size={13} className="text-orange-400" />,
            accentColor: "#f97316",
            accentColorName: "orange",
            fields: [
                { key: "indicator_source", label: "SOURCE", options: SOURCES },
            ]
        },
        severity: {
            title: "SEVERITY",
            icon: <Shield size={13} className="text-red-400" />,
            accentColor: "#ef4444",
            accentColorName: "red",
            fields: [
                { key: "indicator_severity", label: "SEVERITY", options: SEVERITIES, optionLabels: severityLabels },
            ]
        },
    };

    const clearAll = () => setActiveFilters({});

    const activeCount = Object.values(activeFilters).reduce((acc, arr) => acc + arr.length, 0);

    const getCountForCategory = (category: string) => {
        const config = modalConfigs[category];
        if (!config) return 0;
        return config.fields.reduce((acc, f) => acc + (activeFilters[f.key]?.length || 0), 0);
    };

    const handleModalApply = (categoryKey: string, modalFilters: Record<string, string[]>) => {
        const config = modalConfigs[categoryKey];
        const next = { ...activeFilters };
        for (const field of config.fields) {
            delete next[field.key];
        }
        for (const [key, values] of Object.entries(modalFilters)) {
            if (values.length > 0) next[key] = values;
        }
        setActiveFilters(next);
    };

    const sections = [
        { key: "type", title: "INDICATOR TYPE", icon: <AlertTriangle size={11} className="text-cyan-400" />, color: "cyan" },
        { key: "source", title: "SOURCE", icon: <Database size={11} className="text-orange-400" />, color: "orange" },
        { key: "severity", title: "SEVERITY", icon: <Shield size={11} className="text-red-400" />, color: "red" },
    ];

    const borderColors: Record<string, string> = {
        cyan: "border-cyan-500/20 hover:border-cyan-500/40",
        orange: "border-orange-500/20 hover:border-orange-500/40",
        red: "border-red-500/20 hover:border-red-500/40",
    };
    const textColors: Record<string, string> = {
        cyan: "text-cyan-400",
        orange: "text-orange-400",
        red: "text-red-400",
    };
    const bgColors: Record<string, string> = {
        cyan: "bg-cyan-500/10",
        orange: "bg-orange-500/10",
        red: "bg-red-500/10",
    };

    return (
        <>
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full bg-[var(--bg-primary)]/40 backdrop-blur-md border border-[var(--border-primary)] rounded-xl z-10 flex flex-col font-mono text-sm shadow-[0_4px_30px_rgba(0,0,0,0.2)] pointer-events-auto flex-shrink-0"
            >
                <div
                    className="flex justify-between items-center p-3 cursor-pointer hover:bg-[var(--bg-secondary)]/50 transition-colors border-b border-[var(--border-primary)]/50"
                    onClick={() => setIsMinimized(!isMinimized)}
                >
                    <div className="flex items-center gap-2">
                        <Filter size={12} className="text-cyan-500" />
                        <span className="text-[10px] text-[var(--text-muted)] font-mono tracking-widest">THREAT FILTERS</span>
                        {activeCount > 0 && (
                            <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-sm">
                                {activeCount} ACTIVE
                            </span>
                        )}
                    </div>
                    <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                        {isMinimized ? <SlidersHorizontal size={14} /> : <ChevronUp size={14} />}
                    </button>
                </div>

                <AnimatePresence>
                    {!isMinimized && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-y-auto styled-scrollbar flex flex-col gap-2 p-3 pt-2 max-h-[400px]"
                        >
                            {activeCount > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-[9px] text-red-400 hover:text-red-300 tracking-widest self-end mb-1"
                                >
                                    CLEAR ALL FILTERS
                                </button>
                            )}

                            {sections.map((section) => {
                                const count = getCountForCategory(section.key);
                                return (
                                    <div
                                        key={section.key}
                                        className={`border rounded-lg transition-all cursor-pointer group ${borderColors[section.color] || "border-[var(--border-primary)]"} hover:bg-[var(--bg-primary)]/30`}
                                        onClick={() => setOpenModal(section.key)}
                                    >
                                        <div className="flex items-center justify-between p-2.5 px-3">
                                            <div className="flex items-center gap-2">
                                                {section.icon}
                                                <span className="text-[9px] text-[var(--text-secondary)] tracking-widest group-hover:text-[var(--text-primary)] transition-colors">
                                                    {section.title}
                                                </span>
                                                {count > 0 && (
                                                    <span className={`text-[8px] ${bgColors[section.color]} ${textColors[section.color]} px-1.5 py-0.5 rounded-sm`}>
                                                        {count}
                                                    </span>
                                                )}
                                            </div>
                                            <SlidersHorizontal size={10} className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors" />
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {openModal && modalConfigs[openModal] && (
                    <AdvancedFilterModal
                        key={openModal}
                        title={modalConfigs[openModal].title}
                        icon={modalConfigs[openModal].icon}
                        accentColor={modalConfigs[openModal].accentColor}
                        accentColorName={modalConfigs[openModal].accentColorName}
                        fields={modalConfigs[openModal].fields}
                        activeFilters={activeFilters}
                        onApply={(filters) => handleModalApply(openModal, filters)}
                        onClose={() => setOpenModal(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
