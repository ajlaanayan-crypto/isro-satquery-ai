"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Map, { Source, Layer, NavigationControl, Marker, ViewStateChangeEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { 
  Crosshair, 
  ZoomIn, 
  Layers, 
  Eye, 
  EyeOff, 
  Map as MapIcon,
  MousePointer,
  Radio,
  Activity,
  Maximize2,
  X,
  Target,
  Sparkles
} from "lucide-react";
import { Coordinates, MapActionEvent, SpectralPointProbe } from "@/types";
import { calculatePointProbe, generateDynamicPolygon } from "@/lib/geoEngine";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const OPTICAL_BANDS = [
  "B4-B3-B2 (True Color RGB)",
  "B8-B4-B3 (Color Infrared / Vegetation)",
  "B12-B8A-B4 (SWIR / Moisture Index)"
];

const SAR_MODES = [
  "Sentinel-1 C-SAR (VV + VH Dual-Pol)",
  "VV Single-Pol Backscatter (dB)",
  "VH Cross-Pol Volume Scattering",
  "Bi-Temporal Coherence Loss Matrix"
];

const MAP_STYLES = [
  { label: "High-Res Satellite", value: "mapbox://styles/mapbox/satellite-streets-v12" },
  { label: "Light Vector Carto", value: "mapbox://styles/mapbox/light-v11" },
  { label: "Topography / Outdoors", value: "mapbox://styles/mapbox/outdoors-v12" },
];

export default function DualMapViewer() {
  const [viewState, setViewState] = useState({
    longitude: 78.65,
    latitude: 33.75,
    zoom: 11.5,
    pitch: 0,
    bearing: 0
  });

  const [cursorCoords, setCursorCoords] = useState<Coordinates | null>(null);
  const [probePoint, setProbePoint] = useState<Coordinates | null>({ lng: 78.65, lat: 33.75 });
  const [probeData, setProbeData] = useState<SpectralPointProbe>(() => calculatePointProbe(78.65, 33.75));
  const [showProbeCard, setShowProbeCard] = useState(true);

  const [maskOpacity, setMaskOpacity] = useState(0.80);
  const [showMask, setShowMask] = useState(true);
  const [opticalGeoJSON, setOpticalGeoJSON] = useState<any>(() => ({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Active Delineation", area: "18.4 km²" },
        geometry: {
          type: "Polygon",
          coordinates: [generateDynamicPolygon(78.65, 33.75, 0.04, 20, 1.0)]
        }
      }
    ]
  }));
  const [changeMaskGeoJSON, setChangeMaskGeoJSON] = useState<any>(() => ({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { type: "Bi-Temporal Surface Delta", delta: "-14.2%" },
        geometry: {
          type: "Polygon",
          coordinates: [generateDynamicPolygon(78.65, 33.75, 0.035, 18, 2.2)]
        }
      }
    ]
  }));

  const [activeFeatureLabel, setActiveFeatureLabel] = useState<string>("Hydrological Surface Basin");
  const [selectedOpticalBand, setSelectedOpticalBand] = useState(OPTICAL_BANDS[0]);
  const [selectedSarMode, setSelectedSarMode] = useState(SAR_MODES[0]);
  const [mapStyle, setMapStyle] = useState(MAP_STYLES[0].value);

  // Synchronized map movement handler (zoom and pan)
  const onMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
  }, []);

  // Handle map click for point-based spectral probe
  const handleMapClick = useCallback((e: any) => {
    if (e.lngLat) {
      const lng = parseFloat(e.lngLat.lng.toFixed(5));
      const lat = parseFloat(e.lngLat.lat.toFixed(5));
      setProbePoint({ lng, lat });
      const data = calculatePointProbe(lng, lat);
      setProbeData(data);
      setShowProbeCard(true);
    }
  }, []);

  // Listen to remote actions (chat intent, AOI changes)
  useEffect(() => {
    const handleMapAction = (e: CustomEvent<MapActionEvent>) => {
      const { type, payload } = e.detail;
      if (!payload) return;

      if (type === "SHOW_CHANGE_MASK") {
        setShowMask(true);
        if (payload.geojson) setChangeMaskGeoJSON(payload.geojson);
        if (payload.layerLabel) setActiveFeatureLabel(payload.layerLabel);
        if (payload.probeData) {
          setProbeData(payload.probeData);
          setProbePoint({ lng: payload.probeData.lng, lat: payload.probeData.lat });
        }
        if (payload.coords) {
          const [lng, lat] = payload.coords;
          setViewState((prev) => ({
            ...prev,
            longitude: lng,
            latitude: lat,
            zoom: payload.zoom || prev.zoom
          }));
        }
      } else if (type === "HIGHLIGHT_BBOX") {
        if (payload.geojson) setOpticalGeoJSON(payload.geojson);
        if (payload.layerLabel) setActiveFeatureLabel(payload.layerLabel);
        if (payload.probeData) {
          setProbeData(payload.probeData);
          setProbePoint({ lng: payload.probeData.lng, lat: payload.probeData.lat });
        }
        if (payload.coords) {
          const [lng, lat] = payload.coords;
          setViewState((prev) => ({
            ...prev,
            longitude: lng,
            latitude: lat,
            zoom: payload.zoom || prev.zoom
          }));
        }
      } else if (type === "SET_VIEWPORT") {
        if (payload.coords) {
          const [lng, lat] = payload.coords;
          const newProbe = calculatePointProbe(lng, lat);
          setProbePoint({ lng, lat });
          setProbeData(newProbe);

          // If a new AOI is explicitly selected, initialize fresh ground polygons for this geographic location
          if (payload.geojson) {
            setOpticalGeoJSON(payload.geojson);
          } else {
            const newOpticalPoly = generateDynamicPolygon(lng, lat, 0.04, 20, 1.0);
            const newChangePoly = generateDynamicPolygon(lng, lat, 0.035, 18, 2.2);
            setOpticalGeoJSON({
              type: "FeatureCollection",
              features: [{ type: "Feature", properties: { name: "Surface Delineation" }, geometry: { type: "Polygon", coordinates: [newOpticalPoly] } }]
            });
            setChangeMaskGeoJSON({
              type: "FeatureCollection",
              features: [{ type: "Feature", properties: { type: "Bi-Temporal Surface Delta" }, geometry: { type: "Polygon", coordinates: [newChangePoly] } }]
            });
          }

          setViewState((prev) => ({
            ...prev,
            longitude: lng,
            latitude: lat,
            zoom: payload.zoom || prev.zoom
          }));
        }
      }
    };

    window.addEventListener("map-action" as any, handleMapAction);
    return () => window.removeEventListener("map-action" as any, handleMapAction);
  }, []);

  // Compute live approximate corner coordinate bounds for graticule marks
  const lngSpan = 0.12 * Math.pow(2, 11.5 - viewState.zoom);
  const latSpan = 0.08 * Math.pow(2, 11.5 - viewState.zoom);

  const cornerCoords = {
    nw: `${(viewState.latitude + latSpan).toFixed(3)}°N, ${(viewState.longitude - lngSpan).toFixed(3)}°E`,
    ne: `${(viewState.latitude + latSpan).toFixed(3)}°N, ${(viewState.longitude + lngSpan).toFixed(3)}°E`,
    sw: `${(viewState.latitude - latSpan).toFixed(3)}°N, ${(viewState.longitude - lngSpan).toFixed(3)}°E`,
    se: `${(viewState.latitude - latSpan).toFixed(3)}°N, ${(viewState.longitude + lngSpan).toFixed(3)}°E`,
  };

  return (
    <div className="flex-1 relative flex w-full h-full bg-[#f2f4f6] overflow-hidden select-none">
      {/* Top Center Telemetry & Controls HUD */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto shadow-md rounded-full">
        <div className="glass-panel rounded-full px-5 py-2 flex items-center gap-4 text-xs">
          {/* Map Center Coordinates */}
          <div className="flex items-center gap-1.5" title="Map Center Coordinates">
            <Crosshair className="w-3.5 h-3.5 text-[#001e40]" />
            <span className="font-mono font-semibold text-[#001e40]">
              {`${viewState.latitude.toFixed(4)}°N, ${viewState.longitude.toFixed(4)}°E`}
            </span>
          </div>

          {/* Live Cursor Hover Position */}
          {cursorCoords && (
            <>
              <div className="w-px h-4 bg-[#e2e8f0]"></div>
              <div className="flex items-center gap-1.5" title="Cursor Coordinates">
                <MousePointer className="w-3 h-3 text-[#fe9832]" />
                <span className="font-mono text-[11px] text-[#43474f]">
                  {`${cursorCoords.lat.toFixed(4)}°N, ${cursorCoords.lng.toFixed(4)}°E`}
                </span>
              </div>
            </>
          )}

          <div className="w-px h-4 bg-[#e2e8f0]"></div>

          {/* Zoom Level & Scale */}
          <div className="flex items-center gap-1.5">
            <ZoomIn className="w-3.5 h-3.5 text-[#001e40]" />
            <span className="font-mono font-medium text-[#001e40]">Z: {viewState.zoom.toFixed(1)}</span>
            <span className="text-[10px] font-mono text-[#737780] bg-[#f2f4f6] px-1 rounded">10m GSD</span>
          </div>

          <div className="w-px h-4 bg-[#e2e8f0]"></div>

          {/* Layer Style Dropdown */}
          <div className="flex items-center gap-1.5">
            <MapIcon className="w-3.5 h-3.5 text-[#fe9832]" />
            <select 
              value={mapStyle}
              onChange={(e) => setMapStyle(e.target.value)}
              className="bg-transparent font-mono text-[11px] font-semibold text-[#001e40] focus:outline-none cursor-pointer"
            >
              {MAP_STYLES.map((s, idx) => (
                <option key={idx} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Floating Real-time Spectral Pixel Probe Modal */}
      {showProbeCard && probePoint && probeData && (
        <div className="absolute top-16 left-6 z-40 w-72 bg-white/95 backdrop-blur-md rounded-xl border border-[#e2e8f0] shadow-lg p-3.5 space-y-2.5 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#fe9832]" />
              <span className="font-bold text-[#001e40] uppercase tracking-wider text-[11px]">Spectral Pixel Probe</span>
            </div>
            <button 
              onClick={() => setShowProbeCard(false)}
              className="text-[#737780] hover:text-[#001e40] p-0.5 rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-[#43474f]">
              <span>Coordinates:</span>
              <span className="font-bold text-[#001e40]">{probePoint.lat.toFixed(4)}°N, {probePoint.lng.toFixed(4)}°E</span>
            </div>
            <div className="flex justify-between text-[#43474f]">
              <span>Land Cover Class:</span>
              <span className="font-semibold text-sky-800 bg-sky-50 px-1 rounded">{probeData.landClass}</span>
            </div>
            <div className="flex justify-between text-[#43474f]">
              <span>Est. Elevation:</span>
              <span className="font-semibold text-[#001e40]">{probeData.elevationMeters}m MSL</span>
            </div>
          </div>

          {/* Indices Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#e2e8f0]/80">
            <div className="bg-[#f7f9fb] p-2 rounded border border-[#e2e8f0]">
              <div className="text-[10px] text-[#737780] font-mono">NDWI (Water)</div>
              <div className="text-sm font-bold text-[#001e40] font-mono mt-0.5">{probeData.ndwi}</div>
            </div>
            <div className="bg-[#f7f9fb] p-2 rounded border border-[#e2e8f0]">
              <div className="text-[10px] text-[#737780] font-mono">NDVI (Vegetation)</div>
              <div className="text-sm font-bold text-[#001e40] font-mono mt-0.5">{probeData.ndvi}</div>
            </div>
            <div className="bg-[#f7f9fb] p-2 rounded border border-[#e2e8f0]">
              <div className="text-[10px] text-[#737780] font-mono">SAR VV Backscatter</div>
              <div className="text-sm font-bold text-[#001e40] font-mono mt-0.5">{probeData.sarVV_dB} dB</div>
            </div>
            <div className="bg-[#f7f9fb] p-2 rounded border border-[#e2e8f0]">
              <div className="text-[10px] text-[#737780] font-mono">Soil Moisture (VWC)</div>
              <div className="text-sm font-bold text-emerald-700 font-mono mt-0.5">{probeData.soilMoistureVWC}%</div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-[#737780] text-center pt-0.5">
            Click anywhere on the map to re-probe pixels
          </div>
        </div>
      )}

      {/* ==================== LEFT MAP: OPTICAL (T1) ==================== */}
      <div className="flex-1 relative border-r border-[#e2e8f0]">
        {/* Graticule Corner Geodetic Marks */}
        <div className="absolute top-2 left-2 z-20 font-mono text-[9px] font-semibold text-[#001e40] bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded border border-[#e2e8f0] pointer-events-none">
          NW: {cornerCoords.nw}
        </div>
        <div className="absolute top-2 right-2 z-20 font-mono text-[9px] font-semibold text-[#001e40] bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded border border-[#e2e8f0] pointer-events-none">
          NE: {cornerCoords.ne}
        </div>
        <div className="absolute bottom-2 left-2 z-20 font-mono text-[9px] font-semibold text-[#001e40] bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded border border-[#e2e8f0] pointer-events-none">
          SW: {cornerCoords.sw}
        </div>

        {/* Center Reticle Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none opacity-40">
          <div className="w-8 h-8 border border-[#001e40] rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#001e40] rounded-full"></div>
          </div>
        </div>

        <Map
          {...viewState}
          onMove={onMove}
          onClick={handleMapClick}
          onMouseMove={(e: any) => setCursorCoords({ lng: e.lngLat.lng, lat: e.lngLat.lat })}
          onMouseLeave={() => setCursorCoords(null)}
          mapStyle={mapStyle}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%", cursor: "crosshair" }}
        >
          <NavigationControl position="bottom-left" />

          {/* Synchronized Point Probe Marker */}
          {probePoint && (
            <Marker longitude={probePoint.lng} latitude={probePoint.lat} anchor="center">
              <div className="relative flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-sky-500/30 animate-ping absolute"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#0284c7] ring-2 ring-white shadow-md flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
            </Marker>
          )}
          
          {/* Dynamic Optical Vector Polygons */}
          {opticalGeoJSON && (
            <Source id="optical-features" type="geojson" data={opticalGeoJSON}>
              <Layer
                id="optical-fill"
                type="fill"
                paint={{
                  "fill-color": "#0284c7",
                  "fill-opacity": 0.35
                }}
              />
              <Layer
                id="optical-stroke"
                type="line"
                paint={{
                  "line-color": "#0369a1",
                  "line-width": 2.5
                }}
              />
            </Source>
          )}
        </Map>

        {/* Optical Sensor Control Box (Bottom Left) */}
        <div className="absolute bottom-6 left-14 z-20 pointer-events-auto">
          <div className="glass-panel rounded-lg p-3 w-64 space-y-2 text-xs">
            <div>
              <div className="font-bold text-[#001e40] text-[11px] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                  <span>Optical Baseline (T1)</span>
                </span>
                <span className="text-[9px] font-mono text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">10m GSD</span>
              </div>
              <div className="font-mono text-[10px] text-[#43474f] mt-0.5">Sentinel-2 MSI • 13 Multi-spectral Bands</div>
            </div>
            
            <select 
              value={selectedOpticalBand}
              onChange={(e) => setSelectedOpticalBand(e.target.value)}
              className="w-full bg-[#f7f9fb] border border-[#e2e8f0] rounded p-1.5 font-mono text-[11px] text-[#001e40] focus:outline-none focus:border-[#001e40] cursor-pointer"
            >
              {OPTICAL_BANDS.map((b, i) => (
                <option key={i} value={b}>{b}</option>
              ))}
            </select>

            <div className="flex justify-between items-center pt-1 border-t border-[#e2e8f0]/60 font-mono text-[10px]">
              <span className="text-[#43474f]">Active Feature</span>
              <span className="font-bold text-[#001e40] truncate max-w-[130px]">{activeFeatureLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Split Divider Handle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-14 glass-panel rounded-full flex flex-col justify-center items-center gap-1 z-30 shadow-md pointer-events-none">
        <div className="w-1 h-1 rounded-full bg-[#737780]"></div>
        <div className="w-1 h-1 rounded-full bg-[#737780]"></div>
        <div className="w-1 h-1 rounded-full bg-[#737780]"></div>
      </div>

      {/* ==================== RIGHT MAP: SAR (T2) ==================== */}
      <div className="flex-1 relative">
        {/* Graticule Corner Geodetic Marks */}
        <div className="absolute top-2 left-2 z-20 font-mono text-[9px] font-semibold text-[#001e40] bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded border border-[#e2e8f0] pointer-events-none">
          NW: {cornerCoords.nw}
        </div>
        <div className="absolute top-2 right-2 z-20 font-mono text-[9px] font-semibold text-[#001e40] bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded border border-[#e2e8f0] pointer-events-none">
          NE: {cornerCoords.ne}
        </div>
        <div className="absolute bottom-2 right-2 z-20 font-mono text-[9px] font-semibold text-[#001e40] bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded border border-[#e2e8f0] pointer-events-none">
          SE: {cornerCoords.se}
        </div>

        {/* Center Reticle Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none opacity-40">
          <div className="w-8 h-8 border border-[#fe9832] rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#fe9832] rounded-full"></div>
          </div>
        </div>

        <Map
          {...viewState}
          onMove={onMove}
          onClick={handleMapClick}
          onMouseMove={(e: any) => setCursorCoords({ lng: e.lngLat.lng, lat: e.lngLat.lat })}
          onMouseLeave={() => setCursorCoords(null)}
          mapStyle={mapStyle}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%", cursor: "crosshair" }}
        >
          <NavigationControl position="bottom-right" />

          {/* Synchronized Point Probe Marker */}
          {probePoint && (
            <Marker longitude={probePoint.lng} latitude={probePoint.lat} anchor="center">
              <div className="relative flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-orange-500/30 animate-ping absolute"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#fe9832] ring-2 ring-white shadow-md flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
            </Marker>
          )}
          
          {/* Dynamic Change Mask GeoJSON Polygons */}
          {showMask && changeMaskGeoJSON && (
            <Source id="change-mask-source" type="geojson" data={changeMaskGeoJSON}>
              <Layer 
                id="change-mask-fill" 
                type="fill" 
                paint={{
                  "fill-color": "#fe9832",
                  "fill-opacity": maskOpacity * 0.75
                }} 
              />
              <Layer 
                id="change-mask-line" 
                type="line" 
                paint={{
                  "line-color": "#c2410c",
                  "line-width": 2.5,
                  "line-dasharray": [2, 1]
                }} 
              />
            </Source>
          )}
        </Map>

        {/* SAR Sensor & Change Legend Controls (Bottom Right) */}
        <div className="absolute bottom-6 right-14 z-20 pointer-events-auto">
          <div className="glass-panel rounded-lg p-3.5 w-68 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-[#001e40] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#fe9832]" />
                  <span>SAR Coherence (T2)</span>
                </div>
                <div className="font-mono text-[10px] text-[#43474f]">Sentinel-1 C-SAR • Polarimetric Mode</div>
              </div>
              <button 
                onClick={() => setShowMask(!showMask)}
                className="text-[#43474f] hover:text-[#001e40] p-1 rounded transition-colors cursor-pointer"
                title="Toggle Mask"
              >
                {showMask ? <Eye className="w-3.5 h-3.5 text-[#fe9832]" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>

            <select 
              value={selectedSarMode}
              onChange={(e) => setSelectedSarMode(e.target.value)}
              className="w-full bg-[#f7f9fb] border border-[#e2e8f0] rounded p-1.5 font-mono text-[11px] text-[#001e40] focus:outline-none focus:border-[#001e40] cursor-pointer"
            >
              {SAR_MODES.map((m, i) => (
                <option key={i} value={m}>{m}</option>
              ))}
            </select>

            {/* Dynamic Legend */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-xs bg-[#fe9832] shadow-2xs"></div>
                <span className="font-mono text-[11px] text-[#191c1e]">
                  {changeMaskGeoJSON?.features?.[0]?.properties?.anomalyType || "Bi-Temporal Anomaly"} ({changeMaskGeoJSON?.features?.[0]?.properties?.delta || "-14.2%"})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-xs bg-emerald-500 shadow-2xs"></div>
                <span className="font-mono text-[11px] text-[#191c1e]">
                  Soil Moisture: {probeData.soilMoistureVWC}% VWC
                </span>
              </div>
            </div>

            {/* Opacity Slider */}
            <div className="pt-2 border-t border-[#e2e8f0]/60">
              <div className="flex justify-between items-center mb-1 font-mono text-[10px]">
                <span className="text-[#43474f]">Mask Opacity</span>
                <span className="font-bold text-[#001e40]">{(maskOpacity * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="1" 
                step="0.05" 
                value={maskOpacity}
                onChange={(e) => setMaskOpacity(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#e0e3e5] rounded-lg appearance-none cursor-pointer accent-[#001e40]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
