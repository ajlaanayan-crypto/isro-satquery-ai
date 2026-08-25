# ISRO SatQuery AI — Python Agentic Backend

Production-grade Remote Sensing Vision-Language backend built with **FastAPI**, **LangGraph**, and **PyTorch Difference U-Net**.

---

## 🏗️ Architecture Overview

```
[Next.js GIS Frontend]
         │
         ▼ (HTTP POST /api/analyze)
[FastAPI Server (main.py)]
         │
         ▼
[LangGraph State Machine (agent/langgraph_agent.py)]
    ├── 1. Intent Classifier (LangGraph-Router)
    ├── 2. Difference U-Net Model (models/diff_unet.py)
    ├── 3. Raster to GeoJSON Vectorizer (tools/geo_processor.py)
    └── 4. PDF Mission Report Generator (tools/report_generator.py)
```

---

## ⚡ How to Run Locally

### 1. Install Dependencies
```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Start the Server
```bash
python main.py
```
Server runs on: **`http://localhost:8000`**
- API Docs (Swagger): `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

---

## 🚀 How to Run in Google Colab (with GPU & ngrok)

Open a Google Colab notebook (T4 GPU runtime) and run:

```python
!git clone <your-repo>
%cd backend
!pip install -r requirements.txt

from pyngrok import ngrok
import uvicorn
import nest_asyncio

nest_asyncio.apply()
public_url = ngrok.connect(8000)
print(f"🚀 Live Public Backend URL: {public_url}")

!python main.py
```

Set the generated ngrok URL in your Next.js `.env.local`:
```env
NEXT_PUBLIC_PYTHON_BACKEND_URL=https://your-ngrok-url.ngrok-free.app
```
