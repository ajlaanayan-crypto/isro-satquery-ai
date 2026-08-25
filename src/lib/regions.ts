import { Region } from "@/types";

export interface GeospatialDataset {
  region: Region;
  waterBodiesGeoJSON: any;
  changeMaskGeoJSON: any;
  soilMoistureGeoJSON: any;
  urbanBuiltupGeoJSON: any;
  spectralStats: {
    ndvi: string;
    ndwi: string;
    ndbi: string;
    sarBackscatterVV: string;
    sarBackscatterVH: string;
    soilMoistureVolumetric: string;
  };
}

export const BENCHMARK_REGIONS: Region[] = [
  { 
    id: "ladakh", 
    name: "Pangong Tso & Ladakh Glaciers", 
    coords: [78.65, 33.75], 
    zoom: 11.5,
    description: "High-altitude endorheic alpine lake & permafrost glacial monitoring"
  },
  { 
    id: "kerala", 
    name: "Vembanad Wetland (Kerala)", 
    coords: [76.41, 9.61], 
    zoom: 12.0,
    description: "Ramsar wetland hydrology, mangrove buffers & backwater dynamics"
  },
  { 
    id: "delhi", 
    name: "Yamuna Basin (NCR)", 
    coords: [77.21, 28.61], 
    zoom: 12.0,
    description: "River meander corridor, urban encroachment & seasonal floodplain"
  },
  { 
    id: "sundarbans", 
    name: "Sundarbans Biosphere Delta", 
    coords: [88.85, 21.94], 
    zoom: 11.0,
    description: "Tidal mangrove estuary, coastal erosion & cyclonic inundation"
  },
];

export const REGION_DATASETS: Record<string, GeospatialDataset> = {
  ladakh: {
    region: BENCHMARK_REGIONS[0],
    spectralStats: {
      ndvi: "0.14 (Sparse Alpine)",
      ndwi: "0.86 (Deep Glacial Water)",
      ndbi: "0.05 (Rock/Moraine)",
      sarBackscatterVV: "-14.2 dB",
      sarBackscatterVH: "-21.6 dB",
      soilMoistureVolumetric: "12.4% (Permafrost)"
    },
    waterBodiesGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "Pangong Tso Main Basin", areaSqKm: "698.4", ndwi: 0.88 },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [78.48, 33.74],
              [78.54, 33.72],
              [78.62, 33.73],
              [78.71, 33.75],
              [78.82, 33.77],
              [78.94, 33.79],
              [78.98, 33.82],
              [78.91, 33.84],
              [78.78, 33.82],
              [78.67, 33.80],
              [78.58, 33.78],
              [78.50, 33.77],
              [78.48, 33.74]
            ]]
          }
        },
        {
          type: "Feature",
          properties: { name: "Spangmik Glacial Inlet", areaSqKm: "42.1", ndwi: 0.82 },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [78.52, 33.68],
              [78.58, 33.69],
              [78.61, 33.72],
              [78.56, 33.72],
              [78.52, 33.70],
              [78.52, 33.68]
            ]]
          }
        }
      ]
    },
    changeMaskGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { 
            type: "Glacial Melt Runoff Recession", 
            changeDelta: "-14.2% Shoreline Contraction",
            confidence: 0.96,
            t1Date: "15-OCT-2023",
            t2Date: "18-APR-2024"
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [78.60, 33.76],
              [78.68, 33.78],
              [78.76, 33.81],
              [78.84, 33.83],
              [78.80, 33.85],
              [78.70, 33.83],
              [78.62, 33.80],
              [78.58, 33.78],
              [78.60, 33.76]
            ]]
          }
        }
      ]
    },
    soilMoistureGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { type: "Alpine Alluvial Fan Moisture", vwc: "18.5% Volumetric" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [78.55, 33.69],
              [78.65, 33.71],
              [78.64, 33.74],
              [78.53, 33.72],
              [78.55, 33.69]
            ]]
          }
        }
      ]
    },
    urbanBuiltupGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { type: "Spangmik & Lukung Settlement Outposts", ndbi: 0.38 },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [78.49, 33.74],
              [78.52, 33.74],
              [78.52, 33.76],
              [78.49, 33.76],
              [78.49, 33.74]
            ]]
          }
        }
      ]
    }
  },

  kerala: {
    region: BENCHMARK_REGIONS[1],
    spectralStats: {
      ndvi: "0.78 (Dense Tropical Wetland)",
      ndwi: "0.82 (Lagoon / Backwaters)",
      ndbi: "0.12 (Coastal Settlement)",
      sarBackscatterVV: "-8.4 dB",
      sarBackscatterVH: "-14.9 dB",
      soilMoistureVolumetric: "38.2% (Saturated)"
    },
    waterBodiesGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "Vembanad Lake Estuary", areaSqKm: "203.3", ndwi: 0.85 },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [76.38, 9.52],
              [76.42, 9.56],
              [76.43, 9.64],
              [76.42, 9.72],
              [76.40, 9.77],
              [76.37, 9.74],
              [76.38, 9.66],
              [76.37, 9.58],
              [76.38, 9.52]
            ]]
          }
        },
        {
          type: "Feature",
          properties: { name: "Kumarakom Wetland Channel", areaSqKm: "34.5", ndwi: 0.81 },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [76.42, 9.60],
              [76.47, 9.62],
              [76.46, 9.65],
              [76.41, 9.63],
              [76.42, 9.60]
            ]]
          }
        }
      ]
    },
    changeMaskGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { 
            type: "Monsoonal Flood Inundation & Weed Proliferation", 
            changeDelta: "+22.4% Surface Water Expansion",
            confidence: 0.95,
            t1Date: "05-NOV-2023",
            t2Date: "12-MAY-2024"
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [76.39, 9.55],
              [76.45, 9.58],
              [76.46, 9.68],
              [76.42, 9.71],
              [76.38, 9.63],
              [76.39, 9.55]
            ]]
          }
        }
      ]
    },
    soilMoistureGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { type: "Kuttanad Lowland Saturated Soil", vwc: "44.1% Volumetric" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [76.40, 9.50],
              [76.48, 9.52],
              [76.47, 9.58],
              [76.39, 9.55],
              [76.40, 9.50]
            ]]
          }
        }
      ]
    },
    urbanBuiltupGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { type: "Alappuzha & Kottayam Peri-urban Corridor", ndbi: 0.44 },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [76.32, 9.48],
              [76.36, 9.48],
              [76.36, 9.53],
              [76.32, 9.53],
              [76.32, 9.48]
            ]]
          }
        }
      ]
    }
  },

  delhi: {
    region: BENCHMARK_REGIONS[2],
    spectralStats: {
      ndvi: "0.28 (Urban Vegetation / Parks)",
      ndwi: "0.64 (Turbid River Water)",
      ndbi: "0.68 (Dense Built-up Concrete)",
      sarBackscatterVV: "-5.2 dB (High Corner Reflection)",
      sarBackscatterVH: "-11.8 dB",
      soilMoistureVolumetric: "16.8%"
    },
    waterBodiesGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "Yamuna River Meander Corridor", areaSqKm: "48.2", ndwi: 0.68 },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [77.22, 28.72],
              [77.24, 28.68],
              [77.26, 28.63],
              [77.28, 28.58],
              [77.31, 28.52],
              [77.29, 28.52],
              [77.25, 28.58],
              [77.23, 28.64],
              [77.20, 28.70],
              [77.22, 28.72]
            ]]
          }
        }
      ]
    },
    changeMaskGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { 
            type: "Floodplain Siltation & Seasonal Water Channel Drift", 
            changeDelta: "-9.8% Active Flow Width Reduction",
            confidence: 0.93,
            t1Date: "20-OCT-2023",
            t2Date: "10-MAY-2024"
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [77.23, 28.66],
              [77.27, 28.62],
              [77.29, 28.56],
              [77.26, 28.56],
              [77.24, 28.61],
              [77.22, 28.66],
              [77.23, 28.66]
            ]]
          }
        }
      ]
    },
    soilMoistureGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { type: "Yamuna Khadar Alluvial Floodplain", vwc: "24.6% Volumetric" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [77.22, 28.68],
              [77.28, 28.65],
              [77.30, 28.57],
              [77.26, 28.59],
              [77.22, 28.68]
            ]]
          }
        }
      ]
    },
    urbanBuiltupGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "Central Delhi & Noida Urban Core", ndbi: 0.74 },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [77.16, 28.58],
              [77.24, 28.58],
              [77.24, 28.65],
              [77.16, 28.65],
              [77.16, 28.58]
            ]]
          }
        }
      ]
    }
  },

  sundarbans: {
    region: BENCHMARK_REGIONS[3],
    spectralStats: {
      ndvi: "0.84 (Pristine Mangrove Canopy)",
      ndwi: "0.91 (Tidal Channels & Estuary)",
      ndbi: "-0.15 (Non-urban Biosphere)",
      sarBackscatterVV: "-11.2 dB",
      sarBackscatterVH: "-18.4 dB",
      soilMoistureVolumetric: "46.5% (Tidal Marsh)"
    },
    waterBodiesGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "Matla River Tidal Estuary", areaSqKm: "340.1", ndwi: 0.92 },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [88.75, 21.85],
              [88.82, 21.90],
              [88.88, 21.98],
              [88.94, 22.05],
              [88.90, 22.06],
              [88.83, 21.99],
              [88.77, 21.92],
              [88.71, 21.86],
              [88.75, 21.85]
            ]]
          }
        }
      ]
    },
    changeMaskGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { 
            type: "Coastal Mangrove Shoreline Erosion & Tidal Shift", 
            changeDelta: "-6.7% Coastal Edge Recession",
            confidence: 0.94,
            t1Date: "12-NOV-2023",
            t2Date: "28-APR-2024"
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [88.78, 21.86],
              [88.86, 21.91],
              [88.92, 21.97],
              [88.88, 21.99],
              [88.80, 21.93],
              [88.75, 21.88],
              [88.78, 21.86]
            ]]
          }
        }
      ]
    },
    soilMoistureGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { type: "Mangrove Tidal Mudflat", vwc: "48.2% Volumetric" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [88.76, 21.88],
              [88.84, 21.93],
              [88.83, 21.97],
              [88.74, 21.91],
              [88.76, 21.88]
            ]]
          }
        }
      ]
    },
    urbanBuiltupGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { type: "Gosaba Island Settlement Outpost", ndbi: 0.22 },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [88.78, 22.14],
              [88.82, 22.14],
              [88.82, 22.18],
              [88.78, 22.18],
              [88.78, 22.14]
            ]]
          }
        }
      ]
    }
  }
};
