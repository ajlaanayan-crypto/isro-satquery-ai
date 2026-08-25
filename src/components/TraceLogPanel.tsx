"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { TraceStep } from "@/types";

const INITIAL_STEPS: TraceStep[] = [
  { 
    id: "1", 
    label: "Image Ingestion & CRS Projection", 
    status: "complete", 
    details: "EPSG:32644 (UTM Zone 44N) • Align: 0.12px",
    toolName: "GeoIngest"
  },
  { 
    id: "2", 
    label: "Intent Classification", 
    status: "complete", 
    details: '"Detect water body change" -> BI-TEMPORAL_SAR',
    toolName: "LangGraph-Router"
  },
  { 
    id: "3", 
    label: "Model Dispatch", 
    status: "active", 
    details: "Difference U-Net & RS-SAM Fusion",
    toolName: "Diff-UNet"
  },
  { 
    id: "4", 
    label: "Coordinate Mask Overlay", 
    status: "pending", 
    details: "Awaiting binarized tensor",
    toolName: "MapboxLayer"
  }
];

export default function TraceLogPanel() {
  const [steps, setSteps] = useState<TraceStep[]>(INITIAL_STEPS);

  useEffect(() => {
    const handleTraceUpdate = (e: CustomEvent<TraceStep[]>) => {
      if (e.detail && Array.isArray(e.detail)) {
        setSteps(e.detail);
      }
    };
    window.addEventListener("trace-update" as any, handleTraceUpdate);
    return () => window.removeEventListener("trace-update" as any, handleTraceUpdate);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-6 relative bg-white">
      {/* Vertical Timeline Guide Line */}
      <div className="absolute left-[31px] top-8 bottom-28 w-px bg-[#e2e8f0]"></div>

      {/* Steps List */}
      <div className="space-y-6 relative">
        {steps.map((step, idx) => {
          const isActive = step.status === "active";
          const isComplete = step.status === "complete";

          return (
            <div 
              key={step.id} 
              className={`relative flex items-start gap-4 transition-opacity ${step.status === "pending" ? "opacity-45" : ""}`}
            >
              {/* Timeline Node */}
              <div 
                className={`w-3.5 h-3.5 rounded-full z-10 mt-1 ring-4 ring-white shrink-0 transition-all ${
                  isActive 
                    ? "bg-[#fe9832] active-node" 
                    : isComplete 
                      ? "bg-[#001e40]" 
                      : "bg-[#737780]"
                }`}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? "text-[#fe9832]" : "text-[#737780]"}`}>
                    Step {idx + 1} {isActive ? "(Active)" : ""}
                  </span>
                  {step.toolName && (
                    <span className="font-mono text-[9px] font-semibold text-[#43474f] bg-[#eceef0] px-1.5 py-0.5 rounded">
                      {step.toolName}
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-[#001e40] mt-0.5">{step.label}</div>

                {step.details && (
                  <div className="text-[11px] font-mono text-[#43474f] bg-[#f7f9fb] p-2 rounded border border-[#e2e8f0] mt-1.5 break-all">
                    {step.details}
                  </div>
                )}

                {/* Active Sub-tasks Progress */}
                {isActive && (
                  <div className="mt-2.5 space-y-2">
                    <div className="bg-[#f7f9fb] p-2.5 rounded-lg border border-[#e2e8f0]">
                      <div className="flex justify-between items-center mb-1 font-mono text-[11px]">
                        <span className="font-bold text-[#001e40]">Difference U-Net</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#fe9832]" />
                      </div>
                      <div className="w-full bg-[#e0e3e5] rounded-full h-1.5">
                        <div className="bg-[#fe9832] h-1.5 rounded-full w-full"></div>
                      </div>
                    </div>

                    <div className="bg-[#f7f9fb] p-2.5 rounded-lg border border-[#e2e8f0]">
                      <div className="flex justify-between items-center mb-1 font-mono text-[11px]">
                        <span className="font-bold text-[#001e40]">RS-SAM Segmenter</span>
                        <span className="text-[10px] text-[#43474f]">Processing...</span>
                      </div>
                      <div className="w-full bg-[#e0e3e5] rounded-full h-1.5">
                        <div className="bg-[#001e40] h-1.5 rounded-full w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Confidence Metrics Card */}
      <div className="mt-6 bg-[#f7f9fb] border border-[#e2e8f0] rounded-xl p-4 shadow-2xs">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#737780] mb-2.5">
          Model Confidence Metrics
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] font-mono text-[#43474f]">F1-Score (CDVQA)</div>
            <div className="font-mono text-xl font-bold text-[#001e40] mt-0.5">0.94</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#43474f]">IoU Overlap</div>
            <div className="font-mono text-xl font-bold text-[#001e40] mt-0.5">0.91</div>
          </div>
        </div>
      </div>
    </div>
  );
}
