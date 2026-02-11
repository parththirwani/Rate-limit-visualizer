"use client";

import { useState } from "react";
import { VisualizationData, Algorithm } from "../types/test";
import { simulateRateLimitReal } from "../lib/Realapi";
import EmptyState from "./EmptyState";
import StatsCards from "./StatsCard";
import TokenBucketVisualizer from "./TockenBucketVisualizer";
import TrafficGraph from "./TrafficGraph";
import ControlPanel from "./ControlPannel";
import AlgorithmTimer from "./AlgorithmTimer";

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
      const result = await simulateRateLimitReal(apiKey, requests, algorithm);
      setData(result);
    } catch (error) {
      console.error("Simulation failed:", error);
      
      alert(
        `Simulation failed: ${error instanceof Error ? error.message : "Unknown error"}\n\n` +
        `Please check if the backend server is running.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
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

              {/* Two Column Layout for Graph and Visualizations */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Left: Traffic Timeline Graph */}
                <TrafficGraph timeline={data.timeline} />

                {/* Right: Algorithm-specific visualizations */}
                <div className="space-y-6">
                  {/* Timer for all algorithms - key forces remount on algorithm change */}
                  {selectedAlgorithm && (
                    <AlgorithmTimer 
                      key={selectedAlgorithm} 
                      algorithm={selectedAlgorithm} 
                    />
                  )}

                  {/* Token Bucket Visualization - Only for TOKEN_BUCKET */}
                  {selectedAlgorithm === "TOKEN_BUCKET" && (
                    <TokenBucketVisualizer 
                      key={`bucket-${selectedAlgorithm}`}
                      remaining={data.remaining} 
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}