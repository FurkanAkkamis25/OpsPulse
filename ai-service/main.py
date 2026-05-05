from fastapi import FastAPI
from schemas import AnalyzeRequest, AnalyzeResponse
from models.analyzer import analyze

app = FastAPI(title="OpsPulse AI Service")


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_server(req: AnalyzeRequest) -> AnalyzeResponse:
    result = analyze(req.latencies)
    return AnalyzeResponse(**result)
