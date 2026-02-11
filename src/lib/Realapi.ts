import { Algorithm, VisualizationData, TimelinePoint } from "../types/test";

/**
 * REAL API CLIENT
 * Connects to Redis-backed rate limiting endpoints
 * State persists in Redis between requests
 */

export async function simulateRateLimitReal(
  apiKey: string,
  requests: number,
  algorithm: Algorithm
): Promise<VisualizationData> {
  try {
    // Call the backend API
    const response = await fetch("/api/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey,
        requests,
        algorithm,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // The backend returns: { algorithm, allowed, blocked, total }
    // Transform into VisualizationData format

    // Generate timeline based on results
    const timeline: TimelinePoint[] = [];
    const limit = algorithm === "TOKEN_BUCKET" ? 10 : 5;
    let remaining = limit;

    // Create realistic timeline simulation
    for (let i = 0; i < requests; i++) {
      const isAllowed = i < data.allowed;
      
      if (algorithm === "TOKEN_BUCKET") {
        // Token bucket: simulate refill
        if (i > 0 && i % 2 === 0) {
          remaining = Math.min(limit, remaining + 1);
        }
        if (isAllowed && remaining > 0) {
          remaining--;
        }
      } else {
        // Fixed/Sliding window: simple countdown
        if (isAllowed && remaining > 0) {
          remaining--;
        }
      }

      timeline.push({
        index: i + 1,
        allowed: isAllowed,
        remaining: Math.max(0, remaining),
      });
    }

    const throughput = data.total > 0 ? (data.allowed / data.total) * 100 : 0;
    
    // Calculate actual remaining from limit minus blocked requests
    // For Fixed/Sliding: remaining = limit - (allowed requests in current window)
    // Since we process all requests, remaining should be limit - allowed (if within limit)
    let actualRemaining = 0;
    if (algorithm === "TOKEN_BUCKET") {
      // For token bucket, use the last timeline value
      actualRemaining = timeline[timeline.length - 1]?.remaining || 0;
    } else {
      // For Fixed/Sliding window: remaining = limit - requests made in this window
      // If we made 7 requests and limit is 5, then 5 were allowed, 2 blocked
      // Remaining should be 0 (no more requests allowed in this window)
      actualRemaining = Math.max(0, limit - data.allowed);
    }

    return {
      allowed: data.allowed,
      blocked: data.blocked,
      remaining: actualRemaining,
      timeline,
      throughput,
    };
  } catch (error) {
    console.error("Real API call failed:", error);
    throw error;
  }
}