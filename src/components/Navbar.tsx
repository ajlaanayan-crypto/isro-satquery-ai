"use client";

import { Satellite, Layers, FileUp, MapPin, Bell, Settings, UserCircle } from "lucide-react";
import { BENCHMARK_REGIONS } from "@/lib/regions";

interface NavbarProps {
  activeTab: "maps" | "ingest";
  onTabChange: (tab: "maps" | "ingest") => void;
  selectedRegion: string;
  onRegionChange: (regionId: string) => void;
}

export default function Navbar({
  activeTab,
  onTabChange,
  selectedRegion,
  onRegionChange,
}: NavbarProps) {
  return (
    <nav className="h-16 bg-white/85 backdrop-blur-xl border-b border-[#e2e8f0] px-6 flex items-center justify-between shrink-0 z-50 shadow-xs select-none">
      {/* Brand & Tabs */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#001e40] flex items-center justify-center text-white shadow-xs">
            <Satellite className="w-4 h-4 text-[#fe9832]" />
          </div>
          <span className="font-bold text-lg tracking-tight text-[#001e40]">
            SatQuery <span className="text-[#fe9832]">AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#43474f]">
          <button 
            onClick={() => onTabChange("maps")} 
            className={`pb-1 transition-all flex items-center gap-1.5 ${
              activeTab === "maps" 
                ? "text-[#001e40] border-b-2 border-[#001e40] font-bold" 
                : "hover:text-[#001e40]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Dual-Map Workspace
          </button>
          <button 
            onClick={() => onTabChange("ingest")} 
            className={`pb-1 transition-all flex items-center gap-1.5 ${
              activeTab === "ingest" 
                ? "text-[#001e40] border-b-2 border-[#001e40] font-bold" 
                : "hover:text-[#001e40]"
            }`}
          >
            <FileUp className="w-3.5 h-3.5" /> Data Ingest & Datasets
          </button>
        </div>
      </div>

      {/* AOI Selector */}
      <div className="hidden lg:flex items-center gap-2 bg-[#f2f4f6] px-3 py-1.5 rounded-full border border-[#e2e8f0]">
        <MapPin className="w-3.5 h-3.5 text-[#8f4e00]" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#43474f]">AOI:</span>
        <select 
          value={selectedRegion}
          onChange={(e) => onRegionChange(e.target.value)}
          className="text-xs font-semibold bg-transparent text-[#001e40] focus:outline-none cursor-pointer pr-1"
        >
          {BENCHMARK_REGIONS.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Telemetry & Controls */}
      <div className="flex items-center gap-3.5">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Agent Status: Online</span>
        </div>

        <button className="bg-[#001e40] hover:bg-[#003366] text-white px-4 py-2 rounded-md text-xs font-bold tracking-wide uppercase transition-all shadow-xs">
          Mission Control
        </button>

        <div className="flex items-center gap-1 text-[#43474f] border-l border-[#e2e8f0] pl-3">
          <button className="p-1.5 hover:bg-[#eceef0] rounded-full transition-colors" title="Notifications">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-[#eceef0] rounded-full transition-colors" title="Settings">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-[#eceef0] rounded-full transition-colors" title="User Profile">
            <UserCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
