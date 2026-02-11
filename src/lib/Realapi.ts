import { Algorithm, VisualizationData, TimelinePoint } from "../types/test";

/**
 * REAL API CLIENT
 * Connects to your actual Redis-backed rate limiting endpoints
 * This WILL persist state between requests (unlike the mock)
 */

export async function simulateRateLimitReal(
  apiKey: string,
  requests: number,
  algorithm: Algorithm
): Promise<VisualizationData> {
  try {
    // Call your actual backend API
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
    // We need to transform this into VisualizationData format

    // Generate timeline based on results
    const timeline: TimelinePoint[] = [];
    let remaining = algorithm === "TOKEN_BUCKET" ? 10 : 5;

    // Since backend doesn't return per-request details,
    // we'll simulate a realistic timeline
    for (let i = 0; i < requests; i++) {
      const isAllowed = i < data.allowed;
      
      if (isAllowed && remaining > 0) {
        remaining--;
      }

      timeline.push({
        index: i + 1,
        allowed: isAllowed,
        remaining: Math.max(0, remaining),
      });
    }

    const throughput = (data.allowed / data.total) * 100;

    return {
      allowed: data.allowed,
      blocked: data.blocked,
      remaining,
      timeline,
      throughput,
    };
  } catch (error) {
    console.error("Real API call failed:", error);
    throw error;
  }
}

/**
 * ENHANCED MOCK with STATEFUL simulation
 * Simulates persistent state in browser localStorage
 * Use this to test the UI behavior without Redis
 */

interface RateLimitState {
  apiKey: string;
  algorithm: Algorithm;
  count: number;
  windowStart: number;
  tokens: number;
  lastRefill: number;
  requests: { timestamp: number; id: string }[];
}

const WINDOW_SIZE = 60000; // 60 seconds in milliseconds
const LIMIT = 5;
const BUCKET_SIZE = 10;
const REFILL_RATE = 5; // tokens per second

function getState(apiKey: string, algorithm: Algorithm): RateLimitState {
  const key = `ratelimit_${apiKey}_${algorithm}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    return JSON.parse(stored);
  }

  // Initialize new state
  const now = Date.now();
  return {
    apiKey,
    algorithm,
    count: 0,
    windowStart: now,
    tokens: BUCKET_SIZE,
    lastRefill: now,
    requests: [],
  };
}

function saveState(state: RateLimitState): void {
  const key = `ratelimit_${state.apiKey}_${state.algorithm}`;
  localStorage.setItem(key, JSON.stringify(state));
}

export async function simulateRateLimitStateful(
  apiKey: string,
  requests: number,
  algorithm: Algorithm
): Promise<VisualizationData> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const state = getState(apiKey, algorithm);
  const now = Date.now();
  
  let allowed = 0;
  let blocked = 0;
  const timeline: TimelinePoint[] = [];

  // Process each request
  for (let i = 0; i < requests; i++) {
    let isAllowed = false;
    let currentRemaining = 0;

    if (algorithm === "FIXED_WINDOW") {
      // Check if window has expired
      if (now - state.windowStart >= WINDOW_SIZE) {
        // Reset window
        state.count = 0;
        state.windowStart = now;
      }

      // Check limit
      if (state.count < LIMIT) {
        isAllowed = true;
        state.count++;
        allowed++;
      } else {
        blocked++;
      }
      
      currentRemaining = Math.max(0, LIMIT - state.count);

    } else if (algorithm === "SLIDING_WINDOW") {
      // Remove expired requests
      const windowStart = now - WINDOW_SIZE;
      state.requests = state.requests.filter(
        (req) => req.timestamp > windowStart
      );

      // Check limit
      if (state.requests.length < LIMIT) {
        isAllowed = true;
        state.requests.push({
          timestamp: now + i * 10, // Slight offset for each request
          id: `${now}-${i}`,
        });
        allowed++;
      } else {
        blocked++;
      }

      currentRemaining = Math.max(0, LIMIT - state.requests.length);

    } else if (algorithm === "TOKEN_BUCKET") {
      // Calculate refill
      const elapsed = (now - state.lastRefill) / 1000;
      const refill = elapsed * REFILL_RATE;
      state.tokens = Math.min(BUCKET_SIZE, state.tokens + refill);
      state.lastRefill = now;

      // Check if we have tokens
      if (state.tokens >= 1) {
        isAllowed = true;
        state.tokens -= 1;
        allowed++;
      } else {
        blocked++;
      }

      currentRemaining = Math.floor(state.tokens);
    }

    timeline.push({
      index: i + 1,
      allowed: isAllowed,
      remaining: currentRemaining,
    });
  }

  // Save updated state
  saveState(state);

  const remaining = timeline[timeline.length - 1]?.remaining || 0;
  const throughput = (allowed / requests) * 100;

  return {
    allowed,
    blocked,
    remaining,
    timeline,
    throughput,
  };
}

/**
 * Clear all rate limit state (useful for testing)
 */
export function clearRateLimitState(apiKey?: string): void {
  if (apiKey) {
    // Clear specific API key
    ["FIXED_WINDOW", "SLIDING_WINDOW", "TOKEN_BUCKET"].forEach((algo) => {
      localStorage.removeItem(`ratelimit_${apiKey}_${algo}`);
    });
  } else {
    // Clear all rate limit data
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("ratelimit_")) {
        localStorage.removeItem(key);
      }
    });
  }
}