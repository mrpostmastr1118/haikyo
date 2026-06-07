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
      // SVGアイコン（サイトのカラートーンに合わせたデザイン）
      function planeIconHtml(): string {
        return `<div style="width:30px;height:30px;transform-origin:center;will-change:transform;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30">
            <defs>
              <filter id="pf" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="rgba(44,36,23,0.45)"/>
              </filter>
            </defs>
            <circle cx="15" cy="15" r="13.5" fill="rgba(247,243,236,0.78)" stroke="#D4C9B8" stroke-width="0.8"/>
            <g transform="translate(15,15)" filter="url(#pf)">
              <!-- 胴体 -->
              <ellipse cx="0" cy="0" rx="2.2" ry="9" fill="#6B4A28"/>
              <!-- 主翼 -->
              <path d="M-11,4 L0,-2 L11,4 L9,6.5 L0,1 L-9,6.5Z" fill="#8B6435"/>
              <!-- 尾翼 -->
              <path d="M-4,8 L0,6 L4,8 L0,11Z" fill="#6B4A28" opacity="0.85"/>
            </g>
          </svg>
        </div>`;
      }

      function shipIconHtml(): string {
        return `<div style="width:38px;height:24px;transform-origin:center;will-change:transform;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 24" width="38" height="24">
            <defs>
              <filter id="sf" x="-20%" y="-30%" width="140%" height="160%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="rgba(44,36,23,0.4)"/>
              </filter>
            </defs>
            <g filter="url(#sf)">
              <!-- 船体 -->
              <path d="M3,14 L6,9 L32,9 L35,14 L19,19Z" fill="#8B6435"/>
              <!-- 上部構造 -->
              <rect x="11" y="5" width="14" height="5" rx="1.5" fill="#6B4A28"/>
              <!-- 煙突 -->
              <rect x="16" y="2" width="4" height="4" rx="1" fill="#4A3218"/>
              <rect x="17" y="1" width="2" height="2" rx="0.5" fill="#2C2417" opacity="0.6"/>
              <!-- 喫水線ライン -->
              <line x1="4" y1="15.5" x2="34" y2="15.5" stroke="#C4A882" stroke-width="0.8" opacity="0.6"/>
              <!-- 波紋 -->
              <path d="M33,14 Q36,12 38,16" stroke="#C4A882" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.7"/>
            </g>
          </svg>
        </div>`;
      }

      const vehicles = VEHICLES.map((v) => ({ ...v, progress: v.offset }));
      const vehicleMarkers = new Map<string, ReturnType<typeof L.marker>>();

      vehicles.forEach((v) => {
        const pos = positionAt(v.waypoints, v.progress);
        const html = v.type === 'plane' ? planeIconHtml() : shipIconHtml();
        const size: [number, number] = v.type === 'plane' ? [30, 30] : [38, 24];
        const anchor: [number, number] = v.type === 'plane' ? [15, 15] : [19, 12];
        const icon = L.divIcon({ className: '', html, iconSize: size, iconAnchor: anchor });
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
              // 飛行機: SVGが北向き→heading そのまま回転
              // 船: SVGが東向き(右)→ heading-90 で補正
              const rot = v.type === 'plane' ? heading : heading - 90;
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
