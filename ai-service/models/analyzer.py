import numpy as np
from sklearn.linear_model import LinearRegression


def analyze(latencies: list[float]) -> dict:
    """
    Runs Linear Regression over recent latency samples to produce a
    Health Score, a Dynamic Threshold, and a failure prediction.

    Health Score logic:
      - Baseline: mean latency mapped to 0-100 (lower mean → higher score)
      - Penalty: positive slope (rising trend) reduces the score
      - Penalty: high variance reduces the score

    Dynamic Threshold: mean + 2 standard deviations, floored at 200 ms.
    Predicted Failure: health score below 40 OR slope projects latency
                       doubling within 10 pings.
    """
    arr = np.array(latencies, dtype=float)
    n = len(arr)
    X = np.arange(n).reshape(-1, 1)

    model = LinearRegression().fit(X, arr)
    slope: float = float(model.coef_[0])

    mean_lat = float(arr.mean())
    std_lat = float(arr.std())

    # --- Health Score ---
    # Map mean latency: 0 ms → 100, 2000 ms → 0
    latency_score = max(0.0, 100.0 - (mean_lat / 2000.0) * 100.0)

    # Slope penalty: subtract up to 30 points for a steep upward trend
    slope_penalty = min(30.0, max(0.0, slope * 5.0))

    # Variance penalty: subtract up to 20 points for high jitter
    variance_penalty = min(20.0, (std_lat / max(mean_lat, 1.0)) * 20.0)

    health_score = round(max(0.0, latency_score - slope_penalty - variance_penalty), 1)

    # --- Dynamic Threshold ---
    dynamic_threshold = max(200, int(mean_lat + 2 * std_lat))

    # --- Predicted Failure ---
    # Project 10 pings ahead and check if latency would double current mean
    projected = float(model.predict([[n + 10]])[0])
    predicted_failure = health_score < 40 or projected > mean_lat * 2

    return {
        "health_score": health_score,
        "dynamic_threshold": dynamic_threshold,
        "predicted_failure": predicted_failure,
    }
