"use client";

import { useState } from "react";
import { 
  UploadCloud, 
  FileImage, 
  CheckCircle2, 
  HardDrive, 
  ArrowRight, 
  Sparkles,
  Calendar
} from "lucide-react";
import { BENCHMARK_REGIONS } from "@/lib/regions";

interface IngestPanelProps {
  onSwitchToMaps?: () => void;
}

interface IngestedFile {
  name: string;
  type: string;
  status: "checking" | "valid" | "invalid";
  crs?: string;
  resolution?: string;
}

const PRELOADED_DATASETS = [
  {
    id: "sample-1",
    title: "Pangong Tso Glacial Basin (Ladakh)",
    t1Date: "15-OCT-2023 (Optical T1)",
    t2Date: "18-APR-2024 (SAR T2)",
    crs: "EPSG:32644 (UTM 44N)",
    resolution: "10m GSD (Sentinel 1/2)",
    size: "42.8 MB (GeoTIFF Pair)",
    coords: [78.65, 33.75] as [number, number],
    zoom: 11.5
  },
  {
    id: "sample-2",
    title: "Vembanad Wetland System (Kerala)",
    t1Date: "05-NOV-2023 (Optical T1)",
    t2Date: "12-MAY-2024 (SAR T2)",
    crs: "EPSG:32643 (UTM 43N)",
    resolution: "10m GSD (Sentinel 1/2)",
    size: "68.2 MB (GeoTIFF Pair)",
    coords: [76.41, 9.61] as [number, number],
    zoom: 12.0
  }
];

export default function IngestPanel({ onSwitchToMaps }: IngestPanelProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<IngestedFile[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = Array.from(e.dataTransfer.files).map(f => ({
        name: f.name,
        type: f.name.endsWith(".tif") || f.name.endsWith(".tiff") ? "GeoTIFF (Multispectral)" : "Raster Imagery",
        status: "checking" as const
      }));
      setFiles(prev => [...prev, ...dropped]);
      
      setTimeout(() => {
        setFiles(prev => prev.map(f => 
          f.status === "checking" 
            ? { 
                ...f, 
                status: "valid", 
                crs: "EPSG:4326 (WGS84)", 
                resolution: "10m Pixel Size" 
              } 
            : f
        ));
      }, 1000);
    }
  };

  const loadDataset = (coords: [number, number], zoom: number) => {
    window.dispatchEvent(new CustomEvent("map-action", {
      detail: {
        type: "SET_VIEWPORT",
        payload: { coords, zoom }
      }
    }));
    if (onSwitchToMaps) {
      onSwitchToMaps();
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto p-8 bg-[#f7f9fb] flex flex-col items-center select-none">
      <div className="max-w-3xl w-full space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#001e40] bg-[#eceef0] px-2.5 py-1 rounded-full border border-[#e2e8f0] mb-2">
            <HardDrive className="w-3.5 h-3.5 text-[#fe9832]" />
            <span>Multi-modal Ingestion & Pre-processing Pipeline</span>
          </div>
          <h2 className="text-xl font-bold text-[#001e40]">Remote Sensing Data Ingest</h2>
          <p className="text-xs text-[#43474f] mt-1">
            Upload co-registered Optical (Sentinel-2 / Landsat-9) and SAR (Sentinel-1 / NISAR) GeoTIFF pairs.
          </p>
        </div>
        
        {/* Upload Drop Zone */}
        <div 
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all bg-white shadow-xs ${
            dragActive 
              ? "border-[#001e40] bg-[#f2f4f6]" 
              : "border-[#e2e8f0] hover:border-[#737780]"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="w-12 h-12 rounded-full bg-[#f2f4f6] border border-[#e2e8f0] flex items-center justify-center text-[#001e40] mx-auto mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#001e40]">Drag & Drop GeoTIFF Imagery</h3>
          <p className="text-xs text-[#737780] mt-1">Supports `.tif`, `.tiff`, Cloud Optimized GeoTIFF (COG), and HDF5 pairs</p>
          <button className="mt-4 px-4 py-2 bg-[#001e40] hover:bg-[#003366] text-xs font-bold rounded-md text-white transition-all shadow-xs cursor-pointer">
            Browse File System
          </button>
        </div>

        {/* Uploaded Queue */}
        {files.length > 0 && (
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-[#001e40] uppercase tracking-wider">Ingested Image Validation</h4>
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#f7f9fb] rounded-lg border border-[#e2e8f0]">
                <div className="flex items-center gap-3">
                  <FileImage className="w-5 h-5 text-[#001e40]" />
                  <div>
                    <div className="text-xs font-bold text-[#001e40]">{file.name}</div>
                    <div className="text-[11px] font-mono text-[#737780]">{file.type} {file.crs && `• ${file.crs} • ${file.resolution}`}</div>
                  </div>
                </div>
                <div>
                  {file.status === "checking" && <div className="text-xs font-semibold text-[#001e40] animate-pulse">Validating Projection...</div>}
                  {file.status === "valid" && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Geo-referenced (Aligned)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preloaded Benchmarks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#001e40] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#fe9832]" />
              <span>Pre-aligned Benchmark Datasets</span>
            </h4>
            <span className="text-[11px] font-mono text-[#737780]">Ready for instant inference</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {PRELOADED_DATASETS.map((ds) => (
              <div 
                key={ds.id} 
                className="bg-white border border-[#e2e8f0] rounded-xl p-4 space-y-3 hover:border-[#001e40]/40 hover:shadow-xs transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-[#001e40]">{ds.title}</div>
                  <div className="text-[11px] text-[#43474f] mt-1 space-y-0.5 font-mono">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#737780]" /> {ds.t1Date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#737780]" /> {ds.t2Date}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0]/60 text-[11px]">
                  <span className="font-mono text-[#737780]">{ds.size}</span>
                  <button
                    onClick={() => loadDataset(ds.coords, ds.zoom)}
                    className="flex items-center gap-1 text-xs font-bold text-[#001e40] bg-[#f2f4f6] hover:bg-[#eceef0] px-2.5 py-1 rounded transition-all cursor-pointer"
                  >
                    <span>Load to Viewer</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
