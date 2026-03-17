"use client";

import { useEffect, useRef, useState } from "react";
import type { MapRef } from "react-map-gl/maplibre";

export interface ClusterItem {
    lng: number;
    lat: number;
    count: string | number;
    id: number;
}

/**
 * Extracts cluster label positions from a MapLibre clustered source.
 * Listens for moveend/sourcedata events to keep labels in sync.
 *
 * @param mapRef - React ref to the MapLibre map instance
 * @param sourceId - The source ID to query clusters from (e.g. "ships", "earthquakes")
 * @param geoJSON - The GeoJSON data driving the source (null = no clusters)
 */
export function useClusterLabels(
    mapRef: React.RefObject<MapRef | null>,
    sourceId: string,
    geoJSON: unknown | null
): ClusterItem[] {
    const [clusters, setClusters] = useState<ClusterItem[]>([]);
    const handlerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        const map = mapRef.current?.getMap();
        if (!map || !geoJSON) {
            setClusters([]);
            return;
        }

        // Remove previous handler if it exists
        if (handlerRef.current) {
            map.off("moveend", handlerRef.current);
            map.off("sourcedata", handlerRef.current);
        }

        const update = () => {
            try {
                const features = map.querySourceFeatures(sourceId);
                const raw = features
                    .filter((f: any) => f.properties?.cluster)
                    .map((f: any) => ({
                        lng: (f.geometry as any).coordinates[0],
                        lat: (f.geometry as any).coordinates[1],
                        count: f.properties.point_count_abbreviated || f.properties.point_count,
                        id: f.properties.cluster_id,
                    }));
                const seen = new Set<number>();
                const unique = raw.filter((c) => {
                    if (seen.has(c.id)) return false;
                    seen.add(c.id);
                    return true;
                });
                setClusters(unique);
            } catch {
                setClusters([]);
            }
        };
        handlerRef.current = update;

        map.on("moveend", update);
        map.on("sourcedata", update);
        setTimeout(update, 500);

        return () => {
            map.off("moveend", update);
            map.off("sourcedata", update);
        };
    }, [geoJSON, sourceId]);

    return clusters;
}
