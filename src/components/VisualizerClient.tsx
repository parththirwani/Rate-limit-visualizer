"use client";

import { useState } from "react";
import { VisualizationData, Algorithm } from "../types/test";
import { 
  simulateRateLimitReal, 
  simulateRateLimitStateful,
  clearRateLimitState 
} from "../lib/Realapi";
import EmptyState from "./EmptyState";
import StatsCards from "./StatsCard";
import TokenBucketVisualizer from "./TockenBucketVisualizer";
import TrafficGraph from "./TrafficGraph";
import ControlPanel from "./ControlPannel";

// Toggle this to switch between mock and real API
const USE_REAL_API = false; // Set to true to use actual Redis backend

export default function VisualizerClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<VisualizationData | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm | null>(
    null
  );

  const handleSimulate = async (
    apiKey: string,
    requests: number,
    algorithm: Algorithm
  ) => {
    setIsLoading(true);
    setSelectedAlgorithm(algorithm);

    try {
      // Use real API (Redis-backed) or stateful mock
      const result = USE_REAL_API
        ? await simulateRateLimitReal(apiKey, requests, algorithm)
        : await simulateRateLimitStateful(apiKey, requests, algorithm);
      
      setData(result);
    } catch (error) {
      console.error("Simulation failed:", error);
      
      // Show error to user
      alert(
        `Simulation failed: ${error instanceof Error ? error.message : "Unknown error"}\n\n` +
        `Try: ${USE_REAL_API ? "Check if backend is running" : "Clear browser cache"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset all rate limit state? This will clear all counters.")) {
      clearRateLimitState();
      setData(null);
      alert("Rate limit state cleared! Next simulation will start fresh.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Info Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              {USE_REAL_API ? "🔗 Real API Mode" : "💾 Stateful Mock Mode"}
            </h3>
            <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
              {USE_REAL_API
                ? "Connected to Redis backend. State persists across browser refreshes."
                : "State persists in localStorage. Multiple requests use the same counter."}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="text-xs font-medium text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
          >
            Reset State
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column - Control Panel */}
        <div className="lg:col-span-1">
          <ControlPanel onSimulate={handleSimulate} isLoading={isLoading} />
        </div>

        {/* Right Column - Visualization */}
        <div className="space-y-6 lg:col-span-2">
          {!data && !isLoading && <EmptyState />}

          {data && (
            <>
              {/* Stats Cards */}
              <StatsCards
                allowed={data.allowed}
                blocked={data.blocked}
                remaining={data.remaining}
                throughput={data.throughput}
              />

              {/* Traffic Timeline Graph */}
              <TrafficGraph timeline={data.timeline} />

              {/* Token Bucket Visualization - Only for TOKEN_BUCKET algorithm */}
              {selectedAlgorithm === "TOKEN_BUCKET" && (
                <TokenBucketVisualizer remaining={data.remaining} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}