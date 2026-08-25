"use client";

import { useState } from "react";
import { Cpu } from "lucide-react";
import Navbar from "@/components/Navbar";
import DualMapViewer from "@/components/DualMapViewer";
import TraceLogPanel from "@/components/TraceLogPanel";
import ChatDrawer from "@/components/ChatDrawer";
import IngestPanel from "@/components/IngestPanel";
import { BENCHMARK_REGIONS } from "@/lib/regions";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"maps" | "ingest">("maps");
  const [selectedRegion, setSelectedRegion] = useState(BENCHMARK_REGIONS[0].id);

  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId);
    const region = BENCHMARK_REGIONS.find((r) => r.id === regionId);
    if (region) {
      window.dispatchEvent(
        new CustomEvent("map-action", {
          detail: {
            type: "SET_VIEWPORT",
            payload: { coords: region.coords, zoom: region.zoom },
          },
        })
      );
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f7f9fb] text-[#191c1e] antialiased select-none font-sans overflow-hidden">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedRegion={selectedRegion}
        onRegionChange={handleRegionChange}
      />

      {/* Main Workspace Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Explainable AI Trace */}
        <aside className="w-[320px] bg-white border-r border-[#e2e8f0] flex flex-col z-30 shrink-0 shadow-xs">
          <div className="p-4 border-b border-[#e2e8f0] bg-white flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#001e40]">Explainable AI Trace</h2>
              <p className="text-[11px] font-mono text-[#43474f] mt-0.5">Session: ISRO-SAR-01</p>
            </div>
            <div className="p-1.5 bg-[#f2f4f6] rounded border border-[#e2e8f0]">
              <Cpu className="w-4 h-4 text-[#001e40]" />
            </div>
          </div>
          <TraceLogPanel />
        </aside>

        {/* Central Workspace: Dual-Panel GIS or Data Ingest */}
        <main className="flex-1 relative bg-[#f2f4f6] flex flex-col overflow-hidden">
          {activeTab === "maps" ? (
            <DualMapViewer />
          ) : (
            <IngestPanel onSwitchToMaps={() => setActiveTab("maps")} />
          )}
        </main>

        {/* Right Sidebar: Mission Command Chat */}
        <aside className="w-[340px] bg-white border-l border-[#e2e8f0] flex flex-col z-30 shrink-0 shadow-xs">
          <div className="p-4 border-b border-[#e2e8f0] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#fe9832]"></div>
              <h2 className="text-sm font-bold text-[#001e40]">Mission Command</h2>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#eceef0] text-[#001e40] px-2 py-0.5 rounded">
              v2.4 RS-LLM
            </span>
          </div>
          <ChatDrawer />
        </aside>
      </div>
    </div>
  );
}
