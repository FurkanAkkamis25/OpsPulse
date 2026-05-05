from pydantic import BaseModel, field_validator
from typing import List


class AnalyzeRequest(BaseModel):
    latencies: List[float]

    @field_validator("latencies")
    @classmethod
    def must_have_enough_samples(cls, v: List[float]) -> List[float]:
        if len(v) < 5:
            raise ValueError("At least 5 latency samples required")
        return v


class AnalyzeResponse(BaseModel):
    health_score: float        # 0–100; higher is healthier
    dynamic_threshold: int     # recommended latency threshold in ms
    predicted_failure: bool    # True if trend predicts imminent degradation
