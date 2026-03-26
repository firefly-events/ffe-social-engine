import pytest
from fastapi.testclient import TestClient
from main import app, VOICES_DIR, OUTPUT_DIR

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_teardown():
    # Setup
    VOICES_DIR.mkdir(exist_ok=True)
    OUTPUT_DIR.mkdir(exist_ok=True)

    yield

    # Teardown: clean up dummy files created during tests
    for f in VOICES_DIR.glob("*.wav"):
        f.unlink()
    for f in OUTPUT_DIR.glob("*.wav"):
        f.unlink()


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_list_voices_empty():
    response = client.get("/voices")
    assert response.status_code == 200
    assert response.json() == {"voices": []}


def test_create_and_list_voice():
    # Create a dummy WAV file
    wav_content = b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00"  # noqa: E501

    response = client.post(
        "/voices",
        data={"voice_id": "test_voice"},
        files={"file": ("sample.wav", wav_content, "audio/wav")},
    )
    assert response.status_code == 200
    assert response.json() == {"status": "success", "voice_id": "test_voice"}

    # List voices
    response2 = client.get("/voices")
    assert response2.status_code == 200
    assert "test_voice" in response2.json()["voices"]


def test_generate_speech():
    # Need to create a voice first
    wav_content = b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00"  # noqa: E501
    client.post(
        "/voices",
        data={"voice_id": "test_voice2"},
        files={"file": ("sample.wav", wav_content, "audio/wav")},
    )

    response = client.post(
        "/generate",
        json={"text": "Hello world", "voice_id": "test_voice2", "language": "en"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/wav"


def test_generate_speech_missing_voice():
    response = client.post(
        "/generate",
        json={"text": "Hello world", "voice_id": "nonexistent_voice", "language": "en"},
    )
    assert response.status_code == 404
