"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Key, Server } from "lucide-react";

const STORAGE_KEY = "DarkGrid_onboarding_complete";

interface OnboardingModalProps {
    onClose: () => void;
    onOpenSettings: () => void;
}

const OnboardingModal = React.memo(function OnboardingModal({ onClose, onOpenSettings }: OnboardingModalProps) {
    const handleDismiss = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                key="onboarding-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000]"
                onClick={handleDismiss}
            />
            <motion.div
                key="onboarding-modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-0 z-[10001] flex items-center justify-center pointer-events-none"
            >
                <div
                    className="w-[520px] bg-[var(--bg-secondary)]/98 border border-cyan-900/50 rounded-xl shadow-[0_0_80px_rgba(0,200,255,0.08)] pointer-events-auto flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 pb-4 border-b border-[var(--border-primary)]/80">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                                    <Shield size={20} className="text-cyan-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold tracking-[0.2em] text-[var(--text-primary)] font-mono">DARKGRID</h2>
                                    <span className="text-[9px] text-[var(--text-muted)] font-mono tracking-widest">FIRST-TIME SETUP</span>
                                </div>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="w-8 h-8 rounded-lg border border-[var(--border-primary)] hover:border-red-500/50 flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <p className="text-[11px] text-[var(--text-secondary)] font-mono leading-relaxed">
                            Global Threat Intelligence Dashboard — OSINT indicators (IPs, URLs) on a 3D globe with a live threat feed.
                        </p>
                        <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <Server size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[11px] text-cyan-400 font-mono font-bold mb-1">Backend & API keys</p>
                                    <p className="text-[10px] text-[var(--text-secondary)] font-mono leading-relaxed">
                                        Run the backend (FastAPI + SQLite) and set keys in its <span className="text-cyan-300">.env</span> file:
                                        <span className="text-cyan-300"> ABUSEIPDB_API_KEY</span> for IP abuse data. OpenPhish runs with no key.
                                        For local dev, set <span className="text-cyan-300">NEXT_PUBLIC_THREAT_API_URL=http://localhost:8000</span> in frontend <span className="text-cyan-300">.env.local</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-950/20 border border-green-500/20 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <Key size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[11px] text-green-400 font-mono font-bold mb-1">No keys in the browser</p>
                                    <p className="text-[10px] text-[var(--text-secondary)] font-mono leading-relaxed">
                                        API keys stay on the backend. This dashboard only talks to your threat API.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-[var(--border-primary)]/80 flex justify-end gap-2">
                        <button
                            onClick={onOpenSettings}
                            className="px-4 py-2 rounded border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[10px] font-mono tracking-widest"
                        >
                            SETTINGS
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="px-4 py-2 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 text-[10px] font-mono tracking-widest"
                        >
                            LAUNCH
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
});

export function useOnboarding() {
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const done = localStorage.getItem(STORAGE_KEY);
        if (!done) {
            setShowOnboarding(true);
        }
    }, []);

    return { showOnboarding, setShowOnboarding };
}

export default OnboardingModal;
