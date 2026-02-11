import { VisualizationData, Algorithm } from "../types/test";

// Mock simulation - generates realistic data
export async function simulateRateLimit(
  apiKey: string,
  requests: number,
  algorithm: Algorithm
): Promise<VisualizationData> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const limit = algorithm === "TOKEN_BUCKET" ? 10 : 5;
  let allowed = 0;
  let blocked = 0;
  let remaining = limit;
  const timeline: { index: number; allowed: boolean; remaining: number }[] = [];

  // Simulate request processing
  for (let i = 0; i < requests; i++) {
    let isAllowed = false;

    if (algorithm === "FIXED_WINDOW") {
      // Simple counter
      if (allowed < limit) {
        isAllowed = true;
        allowed++;
        remaining = limit - allowed;
      } else {
        blocked++;
        remaining = 0;
      }
    } else if (algorithm === "SLIDING_WINDOW") {
      // Slightly more sophisticated
      const allowedSoFar = allowed;
      if (allowedSoFar < limit) {
        isAllowed = true;
        allowed++;
        remaining = Math.max(0, limit - allowed);
      } else {
        blocked++;
        remaining = 0;
      }
    } else if (algorithm === "TOKEN_BUCKET") {
      // Token bucket with refill
      const refillRate = 5; // tokens per "interval"
      const refillAmount = Math.floor(i / 2) * 0.5; // gradual refill simulation
      const availableTokens = Math.min(limit, limit - allowed + refillAmount);

      if (availableTokens >= 1) {
        isAllowed = true;
        allowed++;
        remaining = Math.max(0, Math.floor(availableTokens - 1));
      } else {
        blocked++;
        remaining = 0;
      }
    }

    timeline.push({
      index: i + 1,
      allowed: isAllowed,
      remaining,
    });
  }

  const throughput = (allowed / requests) * 100;

  return {
    allowed,
    blocked,
    remaining,
    timeline,
    throughput,
  };
}