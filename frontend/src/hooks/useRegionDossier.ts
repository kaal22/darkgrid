import { useCallback, useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";
import type { RegionDossier, SelectedEntity } from "@/types/dashboard";

export function useRegionDossier(
  selectedEntity: SelectedEntity | null,
  setSelectedEntity: (entity: SelectedEntity | null) => void
) {
  const [regionDossier, setRegionDossier] = useState<RegionDossier | null>(null);
  const [regionDossierLoading, setRegionDossierLoading] = useState(false);

  const handleMapRightClick = useCallback(async (coords: { lat: number; lng: number }) => {
    setSelectedEntity({ type: 'region_dossier', id: `${coords.lat.toFixed(4)}_${coords.lng.toFixed(4)}`, extra: coords });
    setRegionDossierLoading(true);
    setRegionDossier(null);
    try {
      const [dossierRes, sentinelRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/region-dossier?lat=${coords.lat}&lng=${coords.lng}`),
        fetch(`${API_BASE}/api/sentinel2/search?lat=${coords.lat}&lng=${coords.lng}`),
      ]);
      let dossierData: Record<string, unknown> = {};
      if (dossierRes.status === 'fulfilled' && dossierRes.value.ok) {
        dossierData = await dossierRes.value.json();
      }
      let sentinelData = null;
      if (sentinelRes.status === 'fulfilled' && sentinelRes.value.ok) {
        sentinelData = await sentinelRes.value.json();
      }
      setRegionDossier({ lat: coords.lat, lng: coords.lng, ...dossierData, sentinel2: sentinelData });
    } catch (e) {
      console.error("Failed to fetch region dossier", e);
    } finally {
      setRegionDossierLoading(false);
    }
  }, [setSelectedEntity]);

  // Clear dossier when selecting a different entity type
  useEffect(() => {
    if (selectedEntity?.type !== 'region_dossier') {
      setRegionDossier(null);
      setRegionDossierLoading(false);
    }
  }, [selectedEntity]);

  return { regionDossier, regionDossierLoading, handleMapRightClick };
}
