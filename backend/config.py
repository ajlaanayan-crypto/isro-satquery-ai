import os
from pydantic import BaseModel

class Settings(BaseModel):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEVICE: str = "cuda" if os.environ.get("CUDA_VISIBLE_DEVICES") else "cpu"
    
    # Model Weights & Paths
    QWEN2_VL_MODEL_ID: str = "Qwen/Qwen2-VL-7B-Instruct"
    LORA_WEIGHTS_PATH: str = "./weights/qwen2_vl_lora"
    DIFF_UNET_WEIGHTS_PATH: str = "./weights/diff_unet_s1_s2.pth"
    
    # Remote Sensing Default Spatial Resolution
    PIXEL_RESOLUTION_METERS: float = 10.0 # Sentinel-2 / Sentinel-1 10m GSD

settings = Settings()
