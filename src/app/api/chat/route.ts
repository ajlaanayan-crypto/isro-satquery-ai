import { NextResponse } from 'next/server';
import { processDynamicAIQuery } from '@/lib/geoEngine';

export async function POST(req: Request) {
  try {
    const { query, coords, zoom, regionId } = await req.json();
    
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Invalid query payload" }, { status: 400 });
    }

    const targetLng = coords && Array.isArray(coords) && coords.length === 2 ? coords[0] : 78.65;
    const targetLat = coords && Array.isArray(coords) && coords.length === 2 ? coords[1] : 33.75;
    const targetZoom = typeof zoom === "number" ? zoom : 11.5;

    // Check if external Python FastAPI backend is configured
    const pythonBackendUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;

    if (pythonBackendUrl) {
      try {
        const response = await fetch(`${pythonBackendUrl}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            coords: [targetLng, targetLat],
            zoom: targetZoom,
            regionId
          })
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        }
      } catch (backendError) {
        console.warn("Python Backend not reachable, using onboard dynamic engine:", backendError);
      }
    }

    // High-precision onboard engine fallback
    await new Promise((resolve) => setTimeout(resolve, 800));
    const result = processDynamicAIQuery(query, targetLng, targetLat, targetZoom);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Inference Error:", error);
    return NextResponse.json({ error: "Failed to process remote sensing inference" }, { status: 500 });
  }
}
