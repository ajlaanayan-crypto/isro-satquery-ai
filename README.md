# ISRO SatQuery AI (SIH26167)
**Agentic Vision-Language Assistant for Multimodal Remote Sensing Image Analysis**

An interactive GIS workspace powered by Next.js, Tailwind CSS, Lucide Icons, and Mapbox GL JS for synchronized bi-temporal and multi-modal (Optical + SAR) remote sensing image query and change detection.

---

## Key Features

1. **Dual-Panel Synchronized GIS Workspace**:
   - Split-screen comparison between Optical (T1) and SAR (T2) / Change Detection masks.
   - Synchronized zoom, pan, and pitch across both panels.
   - Dynamic change-detection mask opacity slider and bounding box visualization.
   - Real-time mouse hover coordinate tracking (Latitude / Longitude).

2. **Agentic Trace Log (Explainable AI Panel)**:
   - Live step-by-step trace of agent intent classification, tool routing, and confidence metrics (F1-score, NDVI, Built-up indices).

3. **Mission Command Chat**:
   - Natural language queries (e.g. *"Analyze change between T1 and T2"*, *"Highlight water bodies"*, *"Scene description"*).
   - Dynamic map command integration (auto-panning, mask overlay, bounding boxes).

4. **Data Ingest Pipeline**:
   - Drag-and-drop workspace for GeoTIFF / Optical-SAR pairs with validation feedback.

---

## Getting Started

### 1. Environment Setup
Create a `.env.local` file in the root directory and add your Mapbox public token:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

### 2. Install Dependencies & Run Development Server
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
