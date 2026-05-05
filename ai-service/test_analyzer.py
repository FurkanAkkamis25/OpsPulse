from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200


def test_analyze_healthy_server():
    latencies = [120, 115, 118, 122, 119, 121, 117, 123, 116, 120]
    res = client.post("/analyze", json={"latencies": latencies})
    assert res.status_code == 200
    data = res.json()
    assert 0 <= data["health_score"] <= 100
    assert data["dynamic_threshold"] > 0
    assert isinstance(data["predicted_failure"], bool)


def test_analyze_degrading_server():
    # Rising latency trend — should produce a lower health score
    latencies = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
    res = client.post("/analyze", json={"latencies": latencies})
    assert res.status_code == 200
    data = res.json()
    assert data["health_score"] < 50
    assert data["predicted_failure"] is True


def test_analyze_too_few_samples():
    res = client.post("/analyze", json={"latencies": [100, 200]})
    assert res.status_code == 422
