from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
import shutil
import uuid
import os

app = FastAPI(title="Voice Generation Service - XTTSv2")

VOICES_DIR = Path("voices")
OUTPUT_DIR = Path("output")

VOICES_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

tts = None
mps_available = False

try:
    import torch
    from TTS.api import TTS

    mps_available = torch.backends.mps.is_available()
    device = "mps" if mps_available else "cpu"

    # In a real environment, this will download/load the XTTSv2 model
    # We delay loading or conditionally load based on env var for fast testing
    if os.getenv("LOAD_MODEL", "false").lower() == "true":
        tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)
except ImportError:
    pass


class GenerateRequest(BaseModel):
    text: str
    voice_id: str
    language: str = "en"


@app.get("/health")
def health():
    return {
        "status": "ok",
        "mps_available": mps_available,
        "tts_loaded": tts is not None,
    }


@app.get("/voices")
def list_voices():
    voices = []
    if VOICES_DIR.exists():
        for f in VOICES_DIR.glob("*.wav"):
            voices.append(f.stem)
    return {"voices": voices}


@app.post("/voices")
async def create_voice(file: UploadFile = File(...), voice_id: str = Form(...)):
    if not file.filename.lower().endswith(".wav"):
        raise HTTPException(status_code=400, detail="Only WAV files are supported")

    file_path = VOICES_DIR / f"{voice_id}.wav"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"status": "success", "voice_id": voice_id}


@app.post("/generate")
def generate_speech(request: GenerateRequest):
    voice_path = VOICES_DIR / f"{request.voice_id}.wav"
    if not voice_path.exists():
        raise HTTPException(status_code=404, detail="Voice ID not found")

    output_filename = f"{uuid.uuid4()}.wav"
    output_path = OUTPUT_DIR / output_filename

    if tts is None:
        # Mock generation if model isn't loaded (e.g., during tests)
        with open(output_path, "wb") as f:
            f.write(
                b"RIFF\x24\x00\x00\x00WAVEfmt "
                b"\x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
            )  # noqa: E501
    else:
        tts.tts_to_file(
            text=request.text,
            speaker_wav=str(voice_path),
            language=request.language,
            file_path=str(output_path),
        )

    return FileResponse(
        path=output_path, media_type="audio/wav", filename=output_filename
    )
