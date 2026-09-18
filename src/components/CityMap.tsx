import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { HotspotCluster, IncidentReport, VisualizationSettings } from '../types/incident';
import * as maplibregl from 'maplibre-gl';

import { getCategoryTheme } from '../utils/categoryColors';

interface CityMapProps {
  hotspots: HotspotCluster[];
  incidents: IncidentReport[];
  selectedClusterId: string | null;
  onSelectCluster: (cluster: HotspotCluster) => void;
  visSettings: VisualizationSettings;
  onUpdateVisSettings: (settings: Partial<VisualizationSettings>) => void;
  currentHour: number;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export const CityMap: React.FC<CityMapProps> = ({
  hotspots,
  incidents,
  selectedClusterId,
  onSelectCluster,
  visSettings,
  onUpdateVisSettings,
  currentHour,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const onSelectClusterRef = useRef(onSelectCluster);
  onSelectClusterRef.current = onSelectCluster;

  // ─── Build Dark Professional GIS vector style ───────────────────
  const buildCityVectorStyle = useCallback((): maplibregl.StyleSpecification => {
    const tileBase = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.mvt?access_token=${MAPBOX_TOKEN}`;

    return {
      version: 8,
      name: 'CivicPulse Dark GIS Metropolitan',
      sources: {
        'mapbox-streets': {
          type: 'vector',
          tiles: [tileBase],
          maxzoom: 16,
        },
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: { 'background-color': '#080D14' },
        },
        {
          id: 'water',
          type: 'fill',
          source: 'mapbox-streets',
          'source-layer': 'water',
          paint: { 'fill-color': '#0B1522', 'fill-opacity': 0.95 },
        },
        {
          id: 'landuse-park',
          type: 'fill',
          source: 'mapbox-streets',
          'source-layer': 'landuse',
          filter: ['==', 'class', 'park'],
          paint: { 'fill-color': '#0E1A17', 'fill-opacity': 0.6 },
        },
        {
          id: 'road-minor',
          type: 'line',
          source: 'mapbox-streets',
          'source-layer': 'road',
          filter: ['all', ['in', 'class', 'street', 'street_limited', 'service']],
          minzoom: 12,
          paint: {
            'line-color': '#16202C',
            'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.5, 16, 1.5],
          },
        },
        {
          id: 'road-secondary',
          type: 'line',
          source: 'mapbox-streets',
          'source-layer': 'road',
          filter: ['all', ['in', 'class', 'secondary', 'tertiary']],
          minzoom: 10,
          paint: {
            'line-color': '#202E3F',
            'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.8, 14, 2.0, 18, 5],
          },
        },
        {
          id: 'road-primary',
          type: 'line',
          source: 'mapbox-streets',
          'source-layer': 'road',
          filter: ['all', ['in', 'class', 'primary', 'trunk']],
          paint: {
            'line-color': '#2C3E52',
            'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1.0, 14, 3.5, 18, 8],
          },
        },
        {
          id: 'road-highway',
          type: 'line',
          source: 'mapbox-streets',
          'source-layer': 'road',
          filter: ['==', 'class', 'motorway'],
          paint: {
            'line-color': '#394E66',
            'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1.2, 14, 4, 18, 10],
          },
        },
        {
          id: 'building-3d-vector',
          type: 'fill-extrusion',
          source: 'mapbox-streets',
          'source-layer': 'building',
          minzoom: 12,
          paint: {
            'fill-extrusion-color': [
              'interpolate',
              ['linear'],
              ['coalesce', ['get', 'height'], ['get', 'render_height'], 15],
              0, '#0F1823',
              20, '#131E2C',
              50, '#172435',
              100, '#1D2D42',
              250, '#243750',
              450, '#2E4461',
            ],
            'fill-extrusion-height': [
              '*',
              ['coalesce', ['get', 'height'], ['get', 'render_height'], 15],
              visSettings.buildingHeight,
            ],
            'fill-extrusion-base': ['coalesce', ['get', 'min_height'], ['get', 'render_min_height'], 0],
            'fill-extrusion-opacity': 0.8,
          },
        },
        {
          id: 'place-label',
          type: 'symbol',
          source: 'mapbox-streets',
          'source-layer': 'place_label',
          minzoom: 11,
          layout: {
            'text-field': ['get', 'name_en'],
            'text-size': ['interpolate', ['linear'], ['zoom'], 11, 10, 15, 12],
            'text-letter-spacing': 0.05,
          },
          paint: {
            'text-color': '#7A8C9E',
            'text-halo-color': '#080D14',
            'text-halo-width': 1.0,
          },
        },
      ],
    };
  }, [visSettings.buildingHeight]);

  // ─── Fallback raster style (Dark Matter) ────────────────────────
  const buildRasterFallback = useCallback((): maplibregl.StyleSpecification => {
    return {
      version: 8,
      name: 'CivicPulse Dark Basemap',
      sources: {
        'basemap-tiles': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          ],
          tileSize: 512,
        },
      },
      layers: [
        { id: 'bg-fill', type: 'background', paint: { 'background-color': '#080D14' } },
        { id: 'basemap-layer', type: 'raster', source: 'basemap-tiles', paint: { 'raster-opacity': 0.95 } },
      ],
    };
  }, []);

  // ─── Initialize Map ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialStyle = MAPBOX_TOKEN ? buildCityVectorStyle() : buildRasterFallback();

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [77.2195, 28.6315],
      zoom: 13.5,
      pitch: visSettings.pitch || 55,
      bearing: -15,
      maxZoom: 18,
      minZoom: 9,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);

      // Set directional dark lighting
      map.setLight({
        anchor: 'viewport',
        color: '#E8EDF3',
        intensity: 0.35,
        position: [1.5, 90, 40],
      });

      // ─── Incident GeoJSON Source ───
      map.addSource('incident-points', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // ─── Subtle Density Field Layer ───
      map.addLayer({
        id: 'incident-heat',
        type: 'heatmap',
        source: 'incident-points',
        maxzoom: 17,
        paint: {
          'heatmap-weight': ['get', 'weight'],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 10, 0.6, 14, 1.4, 17, 2.2],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0,    'rgba(0, 0, 0, 0)',
            0.2,  'rgba(21, 151, 212, 0.15)',
            0.4,  'rgba(21, 151, 212, 0.3)',
            0.6,  'rgba(212, 154, 50, 0.4)',
            0.8,  'rgba(214, 90, 90, 0.5)',
            1.0,  'rgba(214, 90, 90, 0.65)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 10, 16, 13, 28, 16, 44],
          'heatmap-opacity': Math.min(0.45, (visSettings.heatIntensity / 100) * 0.5),
        },
      });

      // ─── Small Precise Incident Points ───
      map.addLayer({
        id: 'incident-circles',
        type: 'circle',
        source: 'incident-points',
        minzoom: 11,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 2.0, 14, 3.5, 18, 5.5],
          'circle-color': [
            'match', ['get', 'severity'],
            'CRITICAL', '#D65A5A',
            'HIGH', '#DE7A38',
            'MEDIUM', '#D49A32',
            '#1597D4',
          ],
          'circle-opacity': 0.85,
          'circle-stroke-width': 1.0,
          'circle-stroke-color': '#080D14',
        },
      });
    });

    map.on('pitch', () => {
      onUpdateVisSettings({ pitch: Math.round(map.getPitch()) });
    });

    // Handle style loading errors — fallback to raster
    map.on('error', (e) => {
      if (e?.error?.message?.includes('403') || e?.error?.message?.includes('401')) {
        console.warn('Vector tiles failed, falling back to raster');
        map.setStyle(buildRasterFallback());
      }
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, []);

  // ─── Update heatmap opacity ──────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    try {
      const map = mapRef.current;
      if (map.getLayer('incident-heat')) {
        map.setPaintProperty('incident-heat', 'heatmap-opacity', Math.min(0.5, (visSettings.heatIntensity / 100) * 0.55));
      }
    } catch { /* layer not ready */ }
  }, [visSettings.heatIntensity, mapLoaded]);

  // ─── Update 3D Building Heights ──────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    try {
      const map = mapRef.current;
      if (map.getLayer('building-3d-vector')) {
        map.setPaintProperty('building-3d-vector', 'fill-extrusion-height', [
          '*',
          ['coalesce', ['get', 'height'], ['get', 'render_height'], 15],
          visSettings.buildingHeight,
        ]);
      }
    } catch { /* layer not ready */ }
  }, [visSettings.buildingHeight, mapLoaded]);

  // ─── Update incident data ───────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    try {
      const source = mapRef.current.getSource('incident-points') as maplibregl.GeoJSONSource;
      if (!source) return;
      source.setData({
        type: 'FeatureCollection',
        features: incidents.map((inc) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [inc.longitude, inc.latitude] },
          properties: {
            id: inc.id,
            category: inc.category,
            severity: inc.severity,
            weight: inc.severity === 'CRITICAL' ? 1.0 : inc.severity === 'HIGH' ? 0.7 : inc.severity === 'MEDIUM' ? 0.35 : 0.12,
          },
        })),
      });
    } catch { /* source not ready */ }
  }, [incidents, mapLoaded]);

  // ─── Create Restrained GIS Cluster Markers ──────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Show top clusters with precise markers
    const visibleHotspots = hotspots.slice(0, 6);

    visibleHotspots.forEach((cluster, idx) => {
      const isSelected = selectedClusterId === cluster.id;
      const isTop2 = idx < 2;
      const categoryTheme = getCategoryTheme(cluster.category);

      // Container
      const el = document.createElement('div');
      el.style.cssText = `
        display: flex; flex-direction: column; align-items: center;
        cursor: pointer; position: relative; transition: transform 0.15s ease;
        z-index: ${isSelected ? 50 : 30 - idx};
      `;

      // ── Subtle Ring for top critical ──
      if (isTop2) {
        const ring = document.createElement('div');
        ring.style.cssText = `
          position: absolute; width: 32px; height: 32px; border-radius: 50%;
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          border: 1px solid ${categoryTheme.hex}; opacity: 0.4; pointer-events: none;
        `;
        el.appendChild(ring);
      }

      // ── Precise Beacon Dot ──
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 8px; height: 8px; border-radius: 50%;
        background: ${isSelected ? '#1597D4' : categoryTheme.hex};
        border: 1.5px solid #080D14;
        box-shadow: 0 0 6px ${categoryTheme.hex};
        position: relative;
        z-index: 2;
      `;
      el.appendChild(dot);

      // ── Compact GIS Label ──
      const label = document.createElement('div');
      label.style.cssText = `
        margin-top: 3px; padding: 3px 6px;
        border-radius: 3px; background: ${isSelected ? '#151F2A' : '#111A24'};
        border: 1px solid ${isSelected ? '#1597D4' : '#263342'};
        display: flex; align-items: center; gap: 5px; white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
        font-family: 'Inter', sans-serif; transition: all 0.15s;
      `;

      label.innerHTML = `
        <span style="font-size:10px;font-weight:600;color:#E8EDF3;">
          ${cluster.name}
        </span>
        <span style="font-size:9px;font-family:'JetBrains Mono',monospace;color:${categoryTheme.textLight};">
          +${cluster.spikePercentage}%
        </span>
      `;

      el.appendChild(label);

      // Events
      el.addEventListener('click', (e) => { e.stopPropagation(); onSelectClusterRef.current(cluster); });
      el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.05)'; });
      el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; });

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([cluster.longitude, cluster.latitude])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [hotspots, selectedClusterId, mapLoaded]);

  // ─── Update pitch ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setPitch(visSettings.pitch);
  }, [visSettings.pitch]);

  // ─── Fly to selected cluster ─────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !selectedClusterId) return;
    const cluster = hotspots.find((h) => h.id === selectedClusterId);
    if (cluster) {
      mapRef.current.flyTo({
        center: [cluster.longitude, cluster.latitude],
        zoom: 14.8,
        pitch: 52,
        bearing: -18,
        duration: 1600,
        essential: true,
      });
    }
  }, [selectedClusterId, hotspots]);

  // ─── Camera movement across time ────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    if (currentHour >= 0 && currentHour < 6) {
      map.easeTo({ center: [77.2195, 28.6315], zoom: 12.5, pitch: 45, bearing: -10, duration: 2500 });
    } else if (currentHour >= 6 && currentHour < 12) {
      map.easeTo({ center: [77.2300, 28.6560], zoom: 13.0, pitch: 50, bearing: -15, duration: 2500 });
    } else if (currentHour >= 12 && currentHour < 17) {
      map.easeTo({ center: [77.2215, 28.5710], zoom: 12.8, pitch: 50, bearing: -12, duration: 2500 });
    } else if (currentHour >= 17 && currentHour < 19) {
      map.easeTo({ center: [77.1500, 28.5200], zoom: 13.2, pitch: 52, bearing: -18, duration: 3000 });
    } else if (currentHour >= 19) {
      map.easeTo({ center: [77.0878, 28.4950], zoom: 13.5, pitch: 55, bearing: -20, duration: 3000 });
    }
  }, [Math.floor(currentHour / 3), mapLoaded]);

  const [mapMode, setMapMode] = useState<'map' | 'satellite' | 'heatmap'>('map');
  const [searchQuery, setSearchQuery] = useState('');

  const resetCamera = useCallback(() => {
    mapRef.current?.flyTo({ center: [77.2195, 28.6315], zoom: 13.5, pitch: 55, bearing: -15, duration: 1000 });
  }, []);

  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();

  return (
    <div className="relative flex-1 h-full w-full overflow-hidden bg-[#080D14]">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* ── Top Floating Bar ── */}
      <div className="absolute top-3.5 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Top-Left: Map / Satellite / Heatmap Mode Switcher */}
        <div className="flex items-center bg-[#090E16]/90 border border-[#1E293B] rounded-lg p-0.5 pointer-events-auto shadow-lg backdrop-blur-xs">
          <button
            onClick={() => setMapMode('map')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              mapMode === 'map'
                ? 'bg-[#1597D4] text-white shadow-sm'
                : 'text-[#93A1B2] hover:text-white'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setMapMode('satellite')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              mapMode === 'satellite'
                ? 'bg-[#1597D4] text-white shadow-sm'
                : 'text-[#93A1B2] hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapMode('heatmap')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              mapMode === 'heatmap'
                ? 'bg-[#1597D4] text-white shadow-sm'
                : 'text-[#93A1B2] hover:text-white'
            }`}
          >
            Heatmap
          </button>
        </div>

        {/* Top-Center: Search Bar */}
        <div className="relative w-80 max-w-sm pointer-events-auto shadow-lg">
          <input
            type="text"
            placeholder="Search location, ward or incident ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090E16]/90 border border-[#1E293B] rounded-lg pl-3.5 pr-9 py-1.5 text-xs text-white placeholder-[#637184] focus:outline-none focus:border-[#1597D4] backdrop-blur-xs"
          />
          <span className="absolute right-3 top-2 text-[#637184]">🔍</span>
        </div>

        {/* Top-Right: Layers button */}
        <div className="pointer-events-auto">
          <button
            onClick={resetCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#090E16]/90 hover:bg-[#111A24] border border-[#1E293B] text-xs font-medium text-[#93A1B2] hover:text-white transition-colors cursor-pointer shadow-lg backdrop-blur-xs"
          >
            <span className="text-xs">≡</span>
            <span>Layers</span>
          </button>
        </div>
      </div>

      {/* ── Right Map Navigation Tools ── */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col bg-[#090E16]/90 border border-[#1E293B] rounded-lg overflow-hidden shadow-xl backdrop-blur-xs divide-y divide-[#1E293B]">
        <button
          onClick={zoomIn}
          className="w-8 h-8 flex items-center justify-center text-white hover:bg-[#152332] text-sm font-bold transition-colors cursor-pointer"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className="w-8 h-8 flex items-center justify-center text-white hover:bg-[#152332] text-sm font-bold transition-colors cursor-pointer"
          title="Zoom out"
        >
          −
        </button>
        <button
          onClick={resetCamera}
          className="w-8 h-8 flex items-center justify-center text-[#93A1B2] hover:text-white hover:bg-[#152332] text-xs transition-colors cursor-pointer"
          title="Recenter view"
        >
          ◎
        </button>
        <button
          onClick={() => onUpdateVisSettings({ pitch: visSettings.pitch === 0 ? 55 : 0 })}
          className="w-8 h-8 flex items-center justify-center text-[#93A1B2] hover:text-white hover:bg-[#152332] text-xs transition-colors cursor-pointer"
          title="Toggle 3D perspective"
        >
          ☵
        </button>
      </div>

      {/* ── Bottom-Left Legend ── */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#090E16]/90 border border-[#1E293B] text-xs text-[#93A1B2] shadow-lg backdrop-blur-xs">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#D65A5A]" /> Critical
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#D49A32]" /> High
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#1597D4]" /> Normal
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#637184]" /> Resolved
        </span>
      </div>

      {/* ── Selected Incident Callout (as in screenshot) ── */}
      {selectedClusterId && (() => {
        const selectedCluster = hotspots.find((h) => h.id === selectedClusterId);
        if (!selectedCluster) return null;

        return (
          <div className="absolute top-1/3 left-1/3 z-30 w-64 bg-[#090E16]/95 border border-[#1E293B] rounded-lg p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#D65A5A] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D65A5A]" />
                INC-2041
              </span>
              <span className="text-[#637184] text-[10px]">›</span>
            </div>

            <div className="font-bold text-white text-xs leading-none">{selectedCluster.name}</div>
            <div className="text-[11px] text-[#93A1B2] leading-none">Streetlight & Power</div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-[#93A1B2]">{selectedCluster.actualReports} reports</span>
              <span className="text-[#D65A5A] font-medium">· High priority</span>
            </div>

            <div className="text-[10px] text-[#27A878] font-medium flex items-center gap-1 pt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#27A878]" />
              Team 01 assigned
            </div>
          </div>
        );
      })()}
    </div>
  );
};
