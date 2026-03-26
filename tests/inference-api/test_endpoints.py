import hmac
import hashlib
import json
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from main import app, API_KEY, HMAC_SECRET


@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


def generate_headers(body: str) -> dict:
    signature = hmac.new(HMAC_SECRET, body.encode("utf-8"), hashlib.sha256).hexdigest()
    return {
        "Authorization": f"Bearer {API_KEY}",
        "X-Signature": signature,
        "Content-Type": "application/json",
    }


@pytest.mark.asyncio
async def test_health_check(async_client):
    headers = generate_headers("")
    response = await async_client.get("/v1/health", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "gpu_memory_free" in data
    assert "queue_depth" in data


@pytest.mark.asyncio
async def test_auth_failure_no_token(async_client):
    headers = generate_headers("")
    headers.pop("Authorization")
    response = await async_client.get("/v1/health", headers=headers)
    assert response.status_code == 401  # HTTPBearer missing creds usually returns 401


@pytest.mark.asyncio
async def test_auth_failure_invalid_token(async_client):
    headers = generate_headers("")
    headers["Authorization"] = "Bearer invalid_token"
    response = await async_client.get("/v1/health", headers=headers)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid API Key"


@pytest.mark.asyncio
async def test_hmac_failure_invalid_signature(async_client):
    headers = generate_headers("")
    headers["X-Signature"] = "invalid_signature"
    response = await async_client.get("/v1/health", headers=headers)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid HMAC signature"


@pytest.mark.asyncio
async def test_voice_clone_and_queue(async_client):
    payload = {"audio_sample": "base64_encoded_audio_data", "name": "Test Voice"}
    body = json.dumps(payload)
    headers = generate_headers(body)

    response = await async_client.post("/v1/voice/clone", content=body, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "processing"
    assert "clone_id" in data

    clone_id = data["clone_id"]

    # Check queue
    queue_headers = generate_headers("")
    queue_response = await async_client.get(
        f"/v1/queue/{clone_id}", headers=queue_headers
    )
    assert queue_response.status_code == 200
    queue_data = queue_response.json()
    assert queue_data["status"] in ["processing", "complete"]


@pytest.mark.asyncio
async def test_image_generate(async_client):
    payload = {
        "prompt": "A beautiful sunset",
        "style": "realistic",
        "size": "1024x1024",
    }
    body = json.dumps(payload)
    headers = generate_headers(body)

    response = await async_client.post(
        "/v1/image/generate", content=body, headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "image_url" in data
