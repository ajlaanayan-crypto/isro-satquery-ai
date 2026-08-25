from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os

from agent.langgraph_agent import satquery_agent
from tools.report_generator import generate_pdf_mission_report

app = FastAPI(
    title="ISRO SatQuery AI — Remote Sensing Agent Backend",
    description="FastAPI + LangGraph + PyTorch Difference U-Net Backend for Multi-Modal Satellite Analysis",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    query: str
    coords: Optional[List[float]] = [78.65, 33.75]
    zoom: Optional[float] = 11.5
    regionId: Optional[str] = "ladakh"

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ISRO SatQuery AI Backend"}

@app.post("/api/analyze")
async def analyze_query(req: AnalyzeRequest):
    """
    Main Endpoint: Receives natural language query and viewport coordinates,
    runs LangGraph state machine, and returns structured GeoJSON & metrics.
    """
    try:
        initial_state = {
            "query": req.query,
            "coords": req.coords or [78.65, 33.75],
            "zoom": req.zoom or 11.5
        }
        
        result = satquery_agent.invoke(initial_state)

        # Convert dictionary metrics to array format for Next.js frontend
        formatted_metrics = []
        for k, v in result.get("metrics", {}).items():
            formatted_metrics.append({
                "label": k,
                "value": str(v),
                "trend": "down" if "-" in str(v) else "up"
            })

        return {
            "response": result["response_text"],
            "metrics": formatted_metrics,
            "mapAction": {
                "type": result.get("action_type", "SHOW_CHANGE_MASK"),
                "payload": {
                    "coords": req.coords,
                    "zoom": req.zoom,
                    "geojson": result.get("geojson_mask"),
                    "layerColor": "#fe9832" if result.get("action_type") == "SHOW_CHANGE_MASK" else "#0284c7",
                    "layerLabel": "AI Inferred Delineation"
                }
            },
            "trace": result["trace"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/download-report")
async def download_report_pdf(req: AnalyzeRequest):
    """
    Generates and returns an official PDF Report compiled via ReportLab.
    """
    try:
        result = satquery_agent.invoke({
            "query": req.query,
            "coords": req.coords or [78.65, 33.75],
            "zoom": req.zoom or 11.5
        })

        pdf_bytes = generate_pdf_mission_report(
            query=req.query,
            coords=req.coords or [78.65, 33.75],
            response_summary=result["response_text"],
            metrics=result.get("metrics", {}),
            trace_steps=result.get("trace", [])
        )

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=ISRO_Mission_Report.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
