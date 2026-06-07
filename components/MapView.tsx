'use client';

import { useEffect, useRef } from 'react';
import { ARTICLE_REGION_KEYS } from '@/lib/spots';
import { VEHICLES, positionAt, headingAt } from '@/lib/vehicles';
import 'leaflet/dist/leaflet.css';

interface Props {
  activeRegion: string | null;
  onRegionClick: (regionKey: string) => void;
  regionKeys?: Set<string>;
}

const COLORS = {
  active:  { fillColor: '#6B4A28', fillOpacity: 0.65, color: '#4A3218', weight: 2 },
  article: { fillColor: '#8B6435', fillOpacity: 0.38, color: '#8B6435', weight: 1.2 },
  hover:   { fillColor: '#8B6435', fillOpacity: 0.6,  color: '#6B4A28', weight: 1.5 },
  neutral: { fillColor: '#C8BFB0', fillOpacity: 0.12, color: '#B5A99A', weight: 0.4 },
};

function styleFor(regionKey: string, activeRegion: string | null, regionKeys: Set<string>): import('leaflet').PathOptions {
  if (regionKey === activeRegion) return COLORS.active;
  if (regionKeys.has(regionKey)) return COLORS.article;
  return COLORS.neutral;
}

type AnyLayer = {
  feature: GeoJSON.Feature;
  setStyle: (s: object) => void;
  getElement: () => HTMLElement | undefined;
  on: (events: object) => void;
};

type AnyGeoJSON = { eachLayer: (fn: (l: unknown) => void) => void };

export default function MapView({ activeRegion, onRegionClick, regionKeys = ARTICLE_REGION_KEYS }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<typeof import('leaflet')['map']> | null>(null);
  const worldLayerRef = useRef<AnyGeoJSON | null>(null);
  const japanLayerRef = useRef<AnyGeoJSON | null>(null);
  const activeRegionRef = useRef(activeRegion);
  activeRegionRef.current = activeRegion;

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let ro: ResizeObserver | null = null;

    async function init() {
      const L = (await import('leaflet')).default;
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [36.5, 137],
        zoom: 5,
        zoomControl: false,
        attributionControl: true,
        minZoom: 1.5,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const [worldData, japanData] = await Promise.all([
        fetch('/geojson/world.geojson').then((r) => r.json()),
        fetch('/geojson/japan.geojson').then((r) => r.json()),
      ]);

      if (cancelled) { map.remove(); return; }

      worldData.features = worldData.features.filter(
        (f: GeoJSON.Feature) => (f.properties as Record<string, string>).ADM0_A3 !== 'JPN'
      );

      function attachEvents(layer: AnyGeoJSON, getKey: (f: GeoJSON.Feature) => string) {
        layer.eachLayer((l: unknown) => {
          const typed = l as AnyLayer;
          const key = getKey(typed.feature);
          const hasArticle = regionKeys.has(key);

          typed.on({
            mouseover(e: { target: AnyLayer }) {
              if (key !== activeRegionRef.current) {
                e.target.setStyle(hasArticle ? COLORS.hover : COLORS.neutral);
              }
            },
            mouseout(e: { target: AnyLayer }) {
              e.target.setStyle(styleFor(key, activeRegionRef.current, regionKeys));
            },
            click() {
              if (hasArticle) onRegionClick(key);
            },
          });
        });
      }

      const worldLayer = L.geoJSON(worldData, {
        style(feature): L.PathOptions {
          const key = (feature!.properties as Record<string, string>).ADM0_A3;
          return styleFor(key, activeRegionRef.current, regionKeys);
        },
      }).addTo(map);

      const japanLayer = L.geoJSON(japanData, {
        style(feature): L.PathOptions {
          const key = (feature!.properties as Record<string, string>).nam_ja;
          return styleFor(key, activeRegionRef.current, regionKeys);
        },
      }).addTo(map);

      worldLayerRef.current = worldLayer as unknown as AnyGeoJSON;
      japanLayerRef.current = japanLayer as unknown as AnyGeoJSON;

      attachEvents(worldLayerRef.current, (f) => (f.properties as Record<string, string>).ADM0_A3);
      attachEvents(japanLayerRef.current, (f) => (f.properties as Record<string, string>).nam_ja);

      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 0);

      ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(containerRef.current!);

      // ── アニメーション車両 ─────────────────────
      const vehicles = VEHICLES.map((v) => ({ ...v, progress: v.offset }));
      const vehicleMarkers = new Map<string, ReturnType<typeof L.marker>>();

      vehicles.forEach((v) => {
        const pos = positionAt(v.waypoints, v.progress);
        const icon = L.divIcon({
          className: '',
          html: `<div style="font-size:${v.type === 'plane' ? 18 : 22}px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.4));transform:rotate(0deg);transform-origin:center;">
                   ${v.type === 'plane' ? '✈️' : '🚢'}
                 </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        const marker = L.marker(pos, { icon, interactive: false, zIndexOffset: -1000 }).addTo(map);
        vehicleMarkers.set(v.id, marker);
      });

      let lastTime = performance.now();
      let rafId: number;

      function tick(now: number) {
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        vehicles.forEach((v) => {
          v.progress = ((v.progress + dt / v.speed) % 1 + 1) % 1;
          const pos = positionAt(v.waypoints, v.progress);
          const heading = headingAt(v.waypoints, v.progress);
          const marker = vehicleMarkers.get(v.id);
          if (!marker) return;
          marker.setLatLng(pos);
          const el = marker.getElement();
          if (el) {
            const inner = el.querySelector('div') as HTMLElement | null;
            if (inner) {
              // 飛行機は方位角で回転、船は横方向のみ
              const rot = v.type === 'plane' ? heading - 45 : (heading > 0 ? 0 : 180);
              inner.style.transform = `rotate(${rot}deg)`;
            }
          }
        });

        rafId = requestAnimationFrame(tick);
      }

      rafId = requestAnimationFrame(tick);

      // クリーンアップ登録
      const origReturn = () => {
        cancelAnimationFrame(rafId);
        vehicleMarkers.forEach((m) => m.remove());
      };
      (containerRef.current as HTMLElement & { _vehicleCleanup?: () => void })._vehicleCleanup = origReturn;
    }

    init();

    return () => {
      cancelled = true;
      ro?.disconnect();
      (containerRef.current as HTMLElement & { _vehicleCleanup?: () => void })?._vehicleCleanup?.();
      mapRef.current?.remove();
      mapRef.current = null;
      worldLayerRef.current = null;
      japanLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    function restyle(layer: AnyGeoJSON | null, getKey: (f: GeoJSON.Feature) => string) {
      if (!layer) return;
      layer.eachLayer((l: unknown) => {
        const typed = l as AnyLayer;
        typed.setStyle(styleFor(getKey(typed.feature), activeRegion, regionKeys));
      });
    }
    restyle(worldLayerRef.current, (f) => (f.properties as Record<string, string>).ADM0_A3);
    restyle(japanLayerRef.current, (f) => (f.properties as Record<string, string>).nam_ja);
  }, [activeRegion]);

  return <div ref={containerRef} className="w-full h-full" />;
}
