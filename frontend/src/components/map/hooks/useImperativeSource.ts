import { useEffect, useRef } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { EMPTY_FC } from "@/components/map/mapConstants";

// Imperatively push GeoJSON data to a MapLibre source, bypassing React reconciliation.
// This is critical for high-volume layers (flights, ships, satellites, fires) where
// React's prop diffing on thousands of coordinate arrays causes memory pressure.
export function useImperativeSource(map: MapRef | null, sourceId: string, geojson: any, debounceMs = 0) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (!map) return;
        const push = () => {
            const src = map.getSource(sourceId) as any;
            if (src && typeof src.setData === 'function') {
                src.setData(geojson || EMPTY_FC);
            }
        };
        if (debounceMs > 0) {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(push, debounceMs);
            return () => { if (timerRef.current) clearTimeout(timerRef.current); };
        }
        push();
    }, [map, sourceId, geojson, debounceMs]);
}
