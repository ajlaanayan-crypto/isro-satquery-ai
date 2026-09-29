import os
import shutil
import time
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ml_engine import SatQueryMLEngine

app = FastAPI(
    title="SatQuery AI Backend",
    description="API for Multimodal Remote Sensing Image Analysis and Agentic Routing",
    version="1.0.0"
)

# Enable CORS for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the decoupled ML Engine
ml_engine = SatQueryMLEngine()

class QueryResponse(BaseModel):
    task_classified: str
    selected_tools: List[str]
    parameters: Dict[str, Any]
    text_answer: str
    confidence_score: float
    execution_trace: Dict[str, Any]

@app.post("/api/analyze", response_model=QueryResponse)
async def analyze_satellite_data(
    query: str = Form(...),
    image1: Optional[UploadFile] = File(None),
    image2: Optional[UploadFile] = File(None)
):
    start_time = time.time()
    os.makedirs("temp_uploads", exist_ok=True)
    
    # --- HANDLING IMAGE 1 (With Fallback to local data folder) ---
    if image1 and image1.filename:
        path1 = f"temp_uploads/{image1.filename}"
        with open(path1, "wb") as buffer:
            shutil.copyfileobj(image1.file, buffer)
    else:
        # Fallback to pre-made local file if none uploaded
        path1 = "data/sample_timestamp_1.tif"

    # --- HANDLING IMAGE 2 (With Fallback to local data folder) ---
    path2 = None
    if image2 and image2.filename:
        path2 = f"temp_uploads/{image2.filename}"
        with open(path2, "wb") as buffer:
            shutil.copyfileobj(image2.file, buffer)
    elif "change" in query.lower() or "diff" in query.lower():
        # Fallback to second sample file for change analysis if query implies it
        path2 = "data/sample_timestamp_2.tif"

    try:
        ml_output = ml_engine.route_and_execute(query, path1, path2)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Processing Error: {str(e)}")
    finally:
        # Cleanup only temporary uploads (leave the 'data/' folder files untouched)
        if image1 and image1.filename and os.path.exists(path1): 
            os.path.exists(path1) and os.remove(path1)
        if image2 and image2.filename and path2 and os.path.exists(path2): 
            os.remove(path2)

    execution_time = round(time.time() - start_time, 3)

    execution_trace = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "selected_task": ml_output["task_classified"],
        "model_or_tool": ml_output["selected_tools"][-1],
        "parameters_used": {"crs": ml_output["metadata"]["crs"], "bands": ml_output["metadata"]["bands"]},
        "execution_time_seconds": execution_time
    }

    return QueryResponse(
        task_classified=ml_output["task_classified"],
        selected_tools=ml_output["selected_tools"],
        parameters={"image_bounds": ml_output["metadata"]["bounds"]},
        text_answer=ml_output["text_answer"],
        confidence_score=ml_output["confidence_score"],
        execution_trace=execution_trace
    )