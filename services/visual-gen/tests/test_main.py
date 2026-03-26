from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_generate_video():
    response = client.post("/generate", json={"prompt": "A beautiful sunset"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert (
        data["video_url"]
        == "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    )
    assert data["prompt"] == "A beautiful sunset"
