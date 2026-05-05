import axios from 'axios';

interface HealthAnalysis {
  healthScore: number;
  dynamicThreshold: number;
  predictedFailure: boolean;
}

export async function analyzeServer(latencies: number[]): Promise<HealthAnalysis | null> {
  try {
    const { data } = await axios.post<HealthAnalysis>(
      `${process.env.AI_SERVICE_URL}/analyze`,
      { latencies },
      { timeout: 5000 }
    );
    return data;
  } catch {
    return null;
  }
}
