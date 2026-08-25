export interface Coordinates {
  lng: number;
  lat: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface ViewportState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface SpectralPointProbe {
  lng: number;
  lat: number;
  ndwi: number;
  ndvi: number;
  ndbi: number;
  ndsi: number;
  sarVV_dB: number;
  sarVH_dB: number;
  soilMoistureVWC: number;
  elevationMeters: number;
  landClass: string;
}

export interface Region {
  id: string;
  name: string;
  coords: [number, number]; // [lng, lat]
  zoom: number;
  description?: string;
}

export interface TraceStep {
  id: string;
  label: string;
  status: "pending" | "active" | "complete";
  details?: string;
  toolName?: string;
  metrics?: { label: string; value: string }[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  keyFindings?: string[];
  actionType?: string;
  metrics?: { label: string; value: string; trend?: "up" | "down" }[];
}

export interface MapActionPayload {
  coords?: [number, number];
  zoom?: number;
  geojson?: any; // Dynamic GeoJSON
  layerColor?: string;
  layerLabel?: string;
  targetFeature?: string;
  probeData?: SpectralPointProbe;
}

export interface MapActionEvent {
  type: "SHOW_CHANGE_MASK" | "HIGHLIGHT_BBOX" | "SET_VIEWPORT" | "POINT_PROBE";
  payload?: MapActionPayload;
}
