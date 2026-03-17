"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Globe from "three-globe";
import { getThreatApiBase } from "@/lib/threatApi";
import type { MaplibreViewerProps } from "@/types/dashboard";
import { useDashboardData } from "@/lib/DashboardDataContext";

interface ThreatPoint {
  lat: number;
  lng: number;
  size: number;
  baseSize: number;
  color: string;
  count?: number;
  countryCode?: string;
}

// Country code -> centroid (expanded so /api/map buckets resolve)
const COUNTRY_TO_LATLNG: Record<string, { lat: number; lng: number }> = {
  US: { lat: 39.8283, lng: -98.5795 },
  CA: { lat: 56.1304, lng: -106.3468 },
  GB: { lat: 55.3781, lng: -3.436 },
  DE: { lat: 51.1657, lng: 10.4515 },
  FR: { lat: 46.2276, lng: 2.2137 },
  NL: { lat: 52.1326, lng: 5.2913 },
  RU: { lat: 61.524, lng: 105.3188 },
  CN: { lat: 35.8617, lng: 104.1954 },
  JP: { lat: 36.2048, lng: 138.2529 },
  AU: { lat: -25.2744, lng: 133.7751 },
  BR: { lat: -14.235, lng: -51.9253 },
  IN: { lat: 20.5937, lng: 78.9629 },
  ZA: { lat: -30.5595, lng: 22.9375 },
  PL: { lat: 51.9194, lng: 19.1451 },
  UA: { lat: 48.3794, lng: 31.1656 },
  TR: { lat: 38.9637, lng: 35.2433 },
  IT: { lat: 41.8719, lng: 12.5674 },
  ES: { lat: 40.4637, lng: -3.7492 },
  KR: { lat: 35.9078, lng: 127.7669 },
  SG: { lat: 1.3521, lng: 103.8198 },
  MX: { lat: 23.6345, lng: -102.5528 },
  AR: { lat: -38.4161, lng: -63.6167 },
  ID: { lat: -0.7893, lng: 113.9213 },
  TH: { lat: 15.87, lng: 100.9925 },
  VN: { lat: 14.0583, lng: 108.2772 },
  MY: { lat: 4.2105, lng: 101.9758 },
  PH: { lat: 12.8797, lng: 121.774 },
  PK: { lat: 30.3753, lng: 69.3451 },
  NG: { lat: 9.082, lng: 8.6753 },
  EG: { lat: 26.8206, lng: 30.8025 },
  SA: { lat: 23.8859, lng: 45.0792 },
  IR: { lat: 32.4279, lng: 53.688 },
  IQ: { lat: 33.2232, lng: 43.6793 },
  IL: { lat: 31.0461, lng: 34.8516 },
  RO: { lat: 45.9432, lng: 24.9668 },
  CZ: { lat: 49.8175, lng: 15.4729 },
  GR: { lat: 39.0742, lng: 21.8243 },
  PT: { lat: 39.3999, lng: -8.2245 },
  SE: { lat: 60.1282, lng: 18.6435 },
  NO: { lat: 60.472, lng: 8.4689 },
  FI: { lat: 61.9241, lng: 25.7482 },
  HU: { lat: 47.1625, lng: 19.5033 },
  BG: { lat: 42.7339, lng: 25.4858 },
  RS: { lat: 44.0165, lng: 21.0059 },
  HR: { lat: 45.1, lng: 15.2 },
  SK: { lat: 48.669, lng: 19.699 },
  CL: { lat: -35.6751, lng: -71.543 },
  CO: { lat: 4.5709, lng: -74.2973 },
  PE: { lat: -9.19, lng: -75.0152 },
  NZ: { lat: -40.9006, lng: 174.886 },
  HK: { lat: 22.3193, lng: 114.1694 },
  TW: { lat: 23.6978, lng: 120.9605 },
  KZ: { lat: 48.0196, lng: 66.9237 },
  BY: { lat: 53.7098, lng: 27.9534 },
  MD: { lat: 47.4116, lng: 28.3699 },
  GE: { lat: 42.3154, lng: 43.3569 },
  AZ: { lat: 40.1431, lng: 47.5769 },
  AM: { lat: 40.0691, lng: 45.0382 },
  KE: { lat: -0.0236, lng: 37.9062 },
  GH: { lat: 7.9465, lng: -1.0232 },
  MA: { lat: 31.7917, lng: -7.0926 },
  TN: { lat: 33.8869, lng: 9.5375 },
  AE: { lat: 23.4241, lng: 53.8478 },
  QA: { lat: 25.3548, lng: 51.1839 },
  KW: { lat: 29.3117, lng: 47.4818 },
  BD: { lat: 23.685, lng: 90.3563 },
  LK: { lat: 7.8731, lng: 80.7718 },
  MM: { lat: 21.9162, lng: 95.956 },
  KH: { lat: 12.5657, lng: 104.991 },
  NP: { lat: 28.3949, lng: 84.124 },
  EC: { lat: -1.8312, lng: -78.1834 },
  VE: { lat: 6.4238, lng: -66.5897 },
  ZW: { lat: -19.0154, lng: 29.1549 },
  ET: { lat: 9.145, lng: 40.4897 },
};

function ThreatGlobeViewer({
  flyToLocation,
  onViewStateChange,
}: Pick<MaplibreViewerProps, "flyToLocation" | "onViewStateChange">) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const globeRef = useRef<any>(null);
  const pointsBaseRef = useRef<ThreatPoint[]>([]);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const { setSelectedEntity } = useDashboardData();

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02030a);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 0, 350);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x88aaff, 0.6);
    scene.add(ambientLight);
    const directional = new THREE.DirectionalLight(0x55ffff, 0.9);
    directional.position.set(200, 200, 200);
    scene.add(directional);

    const globe = new (Globe as any)()
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .showAtmosphere(true)
      .atmosphereColor("#38f2ff")
      .atmosphereAltitude(0.25);

    globe
      .pointsData([])
      .pointAltitude((d: ThreatPoint) => 0.008 + d.size * 0.008)
      .pointColor((d: ThreatPoint) => d.color)
      .pointRadius((d: ThreatPoint) => d.size)
      .pointsMerge(true);

    globe.rotation.y = -0.4;
    scene.add(globe);
    globeRef.current = globe;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 0.6;
    controls.enablePan = false;
    controls.minDistance = 200;
    controls.maxDistance = 450;
    controls.autoRotate = isAutoRotate;
    controls.autoRotateSpeed = 0.15;
    controlsRef.current = controls;

    const base = getThreatApiBase();
    const fetchBuckets = async () => {
      try {
        const res = await fetch(`${base}/api/map`);
        const data: { buckets: { country: string | null; count: number }[] } = await res.json();
        const points: ThreatPoint[] = [];

        (data.buckets || []).forEach((bucket) => {
          if (!bucket.country || bucket.count <= 0) return;
          const cc = bucket.country.toUpperCase().slice(0, 2);
          const coord = COUNTRY_TO_LATLNG[cc];
          if (!coord) return;
          // Smaller radar-style pings: keep sizes subtle even for large buckets
          const baseSize = Math.min(0.22, 0.05 + Math.log10(bucket.count + 1) * 0.05);
          let color = "#36e0ff";
          if (bucket.count > 100) color = "#ff4b7a";
          else if (bucket.count > 20) color = "#ffd447";
          points.push({
            lat: coord.lat,
            lng: coord.lng,
            size: baseSize,
            baseSize,
            color,
            count: bucket.count,
            countryCode: cc,
          });
        });

        pointsBaseRef.current = points;
        globe.pointsData(points.length ? points.map((p) => ({ ...p, size: p.baseSize })) : []);
      } catch (err) {
        console.error("Failed to load threat map buckets", err);
      }
    };

    void fetchBuckets();
    const mapInterval = setInterval(fetchBuckets, 30000);

    // Click-to-select: raycast on globe, then pick nearest bucket by lat/lng
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      if (!renderer || !globeRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      mouse.set(x, y);
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObject(globeRef.current, true);
      if (!intersects.length) return;

      const point = intersects[0].point;
      const r = point.length();
      if (!r) return;

      const lat = (Math.asin(point.y / r) * 180) / Math.PI;
      const lng = (Math.atan2(point.z, point.x) * 180) / Math.PI;

      const basePoints = pointsBaseRef.current;
      if (!basePoints.length) return;

      let closest: ThreatPoint | null = null;
      let bestDist = Infinity;
      for (const p of basePoints) {
        const dLat = lat - p.lat;
        const dLng = lng - p.lng;
        const distSq = dLat * dLat + dLng * dLng;
        if (distSq < bestDist) {
          bestDist = distSq;
          closest = p;
        }
      }

      // Only trigger if click is reasonably near a ping (~20 degrees)
      if (closest && bestDist <= 20 * 20 && closest.countryCode) {
        setSelectedEntity({
          type: "threat_bucket",
          id: closest.countryCode,
          extra: { country: closest.countryCode, count: closest.count ?? 0 },
        });
      }
    };

    renderer.domElement.addEventListener("click", handleClick);

    const PING_PERIOD_SEC = 1.4;
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = Date.now() / 1000;
      const pulse = 0.8 + 0.3 * Math.sin((2 * Math.PI * t) / PING_PERIOD_SEC);
      const basePoints = pointsBaseRef.current;
      if (basePoints.length > 0 && globeRef.current) {
        const pulsed = basePoints.map((p) => ({ ...p, size: p.baseSize * pulse }));
        globeRef.current.pointsData(pulsed);
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(mapInterval);
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", handleClick);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Keep controls in sync with isAutoRotate
  useEffect(() => {
    const c = controlsRef.current;
    if (c) c.autoRotate = isAutoRotate;
  }, [isAutoRotate]);

  // Fly to location: rotate globe so lat/lng is in front
  useEffect(() => {
    if (!flyToLocation || !globeRef.current) return;
    const { lat, lng } = flyToLocation;
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((90 - lng) * Math.PI) / 180;
    globeRef.current.rotation.x = phi;
    globeRef.current.rotation.y = theta;
    onViewStateChange?.({ zoom: 2, latitude: lat });
  }, [flyToLocation, onViewStateChange]);

  const toggleRotate = () => setIsAutoRotate((v) => !v);
  const resetView = () => {
    const c = controlsRef.current;
    if (c) c.reset();
  };
  const zoomIn = () => {
    const c = controlsRef.current;
    if (c) c.object.position.multiplyScalar(0.95);
  };
  const zoomOut = () => {
    const c = controlsRef.current;
    if (c) c.object.position.multiplyScalar(1.05);
  };

  return (
    <div className="absolute inset-0 w-full h-full" ref={containerRef}>
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <button
          type="button"
          onClick={toggleRotate}
          className="bg-[var(--bg-primary)]/80 backdrop-blur border border-cyan-500/60 rounded px-2 py-1 text-[9px] font-mono tracking-widest text-cyan-400 hover:border-cyan-400 transition-colors"
        >
          {isAutoRotate ? "PAUSE" : "PLAY"}
        </button>
        <button
          type="button"
          onClick={resetView}
          className="bg-[var(--bg-primary)]/80 backdrop-blur border border-cyan-500/60 rounded px-2 py-1 text-[9px] font-mono tracking-widest text-cyan-400 hover:border-cyan-400 transition-colors"
        >
          RESET
        </button>
        <button
          type="button"
          onClick={zoomIn}
          className="bg-[var(--bg-primary)]/80 backdrop-blur border border-cyan-500/60 rounded px-2 py-1 text-[9px] font-mono tracking-widest text-cyan-400 hover:border-cyan-400 transition-colors"
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          className="bg-[var(--bg-primary)]/80 backdrop-blur border border-cyan-500/60 rounded px-2 py-1 text-[9px] font-mono tracking-widest text-cyan-400 hover:border-cyan-400 transition-colors"
        >
          −
        </button>
      </div>
    </div>
  );
}

export default ThreatGlobeViewer;
