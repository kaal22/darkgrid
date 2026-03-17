"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { interpolatePosition } from "@/utils/positioning";
import { INTERP_TICK_MS } from "@/lib/constants";

/**
 * Custom hook that provides position interpolation for flights, ships, and satellites.
 * Tracks elapsed time since last data refresh and provides helper functions
 * to smoothly animate entity positions between API updates.
 */
export function useInterpolation() {
    // Interpolation tick — bumps every INTERP_TICK_MS to animate entity positions
    const [interpTick, setInterpTick] = useState(0);
    const dataTimestamp = useRef(Date.now());

    useEffect(() => {
        const iv = setInterval(() => setInterpTick((t) => t + 1), INTERP_TICK_MS);
        return () => clearInterval(iv);
    }, []);

    /** Call this when new data arrives to reset the interpolation baseline */
    const resetTimestamp = useCallback(() => {
        dataTimestamp.current = Date.now();
    }, []);

    // Elapsed seconds since last data refresh (used for position interpolation)
    const dtSeconds = useMemo(() => {
        void interpTick; // use the tick to trigger recalc
        return (Date.now() - dataTimestamp.current) / 1000;
    }, [interpTick]);

    /** Interpolate a flight's position if airborne and has speed + heading */
    const interpFlight = useCallback(
        (f: { lat: number; lng: number; speed_knots?: number | null; alt?: number | null; true_track?: number; heading?: number }): [number, number] => {
            if (!f.speed_knots || f.speed_knots <= 0 || dtSeconds <= 0) return [f.lng, f.lat];
            if (f.alt != null && f.alt <= 100) return [f.lng, f.lat];
            if (dtSeconds < 1) return [f.lng, f.lat];
            const heading = f.true_track || f.heading || 0;
            const [newLat, newLng] = interpolatePosition(f.lat, f.lng, heading, f.speed_knots, dtSeconds);
            return [newLng, newLat];
        },
        [dtSeconds]
    );

    /** Interpolate a ship's position using SOG + COG */
    const interpShip = useCallback(
        (s: { lat: number; lng: number; sog?: number; cog?: number; heading?: number }): [number, number] => {
            if (typeof s.sog !== "number" || !s.sog || s.sog <= 0 || dtSeconds <= 0) return [s.lng, s.lat];
            const heading = (typeof s.cog === "number" ? s.cog : 0) || s.heading || 0;
            const [newLat, newLng] = interpolatePosition(s.lat, s.lng, heading, s.sog, dtSeconds);
            return [newLng, newLat];
        },
        [dtSeconds]
    );

    /** Interpolate a satellite's position between API updates */
    const interpSat = useCallback(
        (s: { lat: number; lng: number; speed_knots?: number; heading?: number }): [number, number] => {
            if (!s.speed_knots || s.speed_knots <= 0 || dtSeconds < 1) return [s.lng, s.lat];
            const [newLat, newLng] = interpolatePosition(s.lat, s.lng, s.heading || 0, s.speed_knots, dtSeconds, 0, 65);
            return [newLng, newLat];
        },
        [dtSeconds]
    );

    return { interpTick, interpFlight, interpShip, interpSat, dtSeconds, resetTimestamp, dataTimestamp };
}
