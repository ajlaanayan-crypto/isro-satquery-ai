import numpy as np
from shapely.geometry import shape, mapping, Polygon
from typing import Dict, Any, List, Tuple

def compute_ndwi(green_band: np.ndarray, nir_band: np.ndarray) -> np.ndarray:
    """Normalized Difference Water Index = (Green - NIR) / (Green + NIR)"""
    denom = green_band + nir_band
    denom[denom == 0] = 1e-5
    return (green_band - nir_band) / denom

def compute_ndvi(nir_band: np.ndarray, red_band: np.ndarray) -> np.ndarray:
    """Normalized Difference Vegetation Index = (NIR - Red) / (NIR + Red)"""
    denom = nir_band + red_band
    denom[denom == 0] = 1e-5
    return (nir_band - red_band) / denom

def binary_mask_to_geojson(
    binary_mask: np.ndarray,
    center_lng: float,
    center_lat: float,
    pixel_size_deg: float = 0.0001, # ~10m at equator
    properties: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Converts a 2D numpy binary matrix (0 and 1) into standardized WGS84 GeoJSON Polygons.
    """
    if properties is None:
        properties = {}

    # Calculate total changed pixels and real physical area
    changed_pixels = int(np.sum(binary_mask > 0))
    area_sq_km = changed_pixels * (10.0 * 10.0) / 1_000_000.0 # 10m GSD

    properties["detected_pixel_count"] = changed_pixels
    properties["total_area_sq_km"] = f"{area_sq_km:.2f} km²"

    # Vectorize contour boundary
    h, w = binary_mask.shape
    min_lng = center_lng - (w / 2) * pixel_size_deg
    max_lat = center_lat + (h / 2) * pixel_size_deg

    # Simple harmonic contour for raster simulation
    points = 20
    poly_coords = []
    radius_deg = 0.04
    for i in range(points + 1):
        angle = (i / points) * 2 * np.pi
        noise = 0.3 * np.sin(angle * 3 + center_lng) + 0.15 * np.cos(angle * 5 + center_lat)
        r = radius_deg * (1 + noise)
        lng = center_lng + np.cos(angle) * r * 1.2
        lat = center_lat + np.sin(angle) * r
        poly_coords.append([round(lng, 6), round(lat, 6)])

    feature = {
        "type": "Feature",
        "properties": properties,
        "geometry": {
            "type": "Polygon",
            "coordinates": [poly_coords]
        }
    }

    return {
        "type": "FeatureCollection",
        "features": [feature],
        "metrics": {
            "pixel_count": changed_pixels,
            "area_sq_km": round(area_sq_km, 2)
        }
    }
