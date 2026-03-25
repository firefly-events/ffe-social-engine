import asyncio
import hashlib
import hmac
import os
import uuid
from typing import Dict, List, Optional
from fastapi import FastAPI, Request, HTTPException, BackgroundTasks, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

app = FastAPI(title="Inference API")

API_KEY = os.getenv("INFERENCE_API_KEY", "default-test-key")
HMAC_SECRET = os.getenv("INFERENCE_HMAC_SECRET", "default-test-secret").encode("utf-8")

security = HTTPBearer()

# In-memory queue simulation
jobs: Dict[str, Dict] = {}

class VoiceCloneRequest(BaseModel):
    audio_sample: str
    name: str

class VoiceCloneResponse(BaseModel):
    clone_id: str
    status: str

class VoiceGenerateRequest(BaseModel):
    clone_id: str
    text: str
    speed: float

class VoiceGenerateResponse(BaseModel):
    audio_url: str
    duration_ms: int

class ImageGenerateRequest(BaseModel):
    prompt: str
    style: str
    size: str = "1024x1024"

class ImageGenerateResponse(BaseModel):
    image_url: str

class VideoComposeRequest(BaseModel):
    voice_audio: str
    images: List[str]
    template: str

class VideoComposeResponse(BaseModel):
    video_url: str
    duration_ms: int

class HealthResponse(BaseModel):
    status: str
    gpu_memory_free: int
    queue_depth: int

class QueueResponse(BaseModel):
    status: str
    result_url: Optional[str] = None

async def verify_auth_and_hmac(request: Request, creds: HTTPAuthorizationCredentials = Depends(security)):
    if creds.credentials != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    
    signature = request.headers.get("X-Signature")
    if not signature:
        raise HTTPException(status_code=401, detail="Missing X-Signature header")
    
    body = await request.body()
    expected_mac = hmac.new(HMAC_SECRET, body, hashlib.sha256).hexdigest()
    
    if not hmac.compare_digest(expected_mac, signature):
        raise HTTPException(status_code=401, detail="Invalid HMAC signature")
    
    return True

async def process_job(job_id: str, job_type: str, delay: int = 2):
    await asyncio.sleep(delay)
    if job_type == "voice_clone":
        jobs[job_id]["status"] = "complete"
        jobs[job_id]["result_url"] = f"https://cdn.example.com/voice/{job_id}.wav"
    elif job_type == "voice_generate":
        jobs[job_id]["status"] = "complete"
        jobs[job_id]["result_url"] = f"https://cdn.example.com/voice/gen_{job_id}.wav"
    elif job_type == "image_generate":
        jobs[job_id]["status"] = "complete"
        jobs[job_id]["result_url"] = f"https://cdn.example.com/image/{job_id}.png"
    elif job_type == "video_compose":
        jobs[job_id]["status"] = "complete"
        jobs[job_id]["result_url"] = f"https://cdn.example.com/video/{job_id}.mp4"

@app.post("/v1/voice/clone", response_model=VoiceCloneResponse, dependencies=[Depends(verify_auth_and_hmac)])
async def voice_clone(request: VoiceCloneRequest, background_tasks: BackgroundTasks):
    clone_id = str(uuid.uuid4())
    jobs[clone_id] = {"status": "processing"}
    background_tasks.add_task(process_job, clone_id, "voice_clone")
    return VoiceCloneResponse(clone_id=clone_id, status="processing")

@app.post("/v1/voice/generate", response_model=VoiceGenerateResponse, dependencies=[Depends(verify_auth_and_hmac)])
async def voice_generate(request: VoiceGenerateRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "processing"}
    background_tasks.add_task(process_job, job_id, "voice_generate")
    # For sync endpoints that return final object immediately (from instructions it seems to return URL directly, but queue was mentioned. 
    # Wait, the instruction says:
    # - POST /v1/voice/generate Returns: { audio_url: string, duration_ms: number }
    # So it seems to be synchronous in the return type, but also mentions job queue system. 
    # Let's make it return immediately with dummy URL for now to satisfy the strict signature, or maybe a queued URL.
    return VoiceGenerateResponse(audio_url=f"https://cdn.example.com/voice/gen_{job_id}.wav", duration_ms=5000)

@app.post("/v1/image/generate", response_model=ImageGenerateResponse, dependencies=[Depends(verify_auth_and_hmac)])
async def image_generate(request: ImageGenerateRequest):
    # Synchronous return as per requirements
    job_id = str(uuid.uuid4())
    return ImageGenerateResponse(image_url=f"https://cdn.example.com/image/{job_id}.png")

@app.post("/v1/video/compose", response_model=VideoComposeResponse, dependencies=[Depends(verify_auth_and_hmac)])
async def video_compose(request: VideoComposeRequest):
    job_id = str(uuid.uuid4())
    return VideoComposeResponse(video_url=f"https://cdn.example.com/video/{job_id}.mp4", duration_ms=15000)

@app.get("/v1/health", response_model=HealthResponse, dependencies=[Depends(verify_auth_and_hmac)])
async def health():
    return HealthResponse(status="ok", gpu_memory_free=16384, queue_depth=len([j for j in jobs.values() if j["status"] == "processing"]))

@app.get("/v1/queue/{job_id}", response_model=QueueResponse, dependencies=[Depends(verify_auth_and_hmac)])
async def queue_status(job_id: str):
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return QueueResponse(status=job["status"], result_url=job.get("result_url"))
