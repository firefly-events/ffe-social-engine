from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Visual Generation Service")


class GenerateRequest(BaseModel):
    prompt: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/generate")
def generate_video(request: GenerateRequest):
    # Stub implementation. Returns a static sample video URL.
    # In Phase 2, this will use Stable Video Diffusion (SVD).
    return {
        "status": "success",
        "video_url": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "prompt": request.prompt,
    }
