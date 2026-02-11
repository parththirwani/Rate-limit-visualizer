"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Algorithm } from "@/src/types/test";
import { ALGORITHMS } from "@/src/lib/algorithm/metadata";
import { Loader2 } from "lucide-react";

interface ControlPanelProps {
  onSimulate: (apiKey: string, requests: number, algorithm: Algorithm) => void;
  isLoading: boolean;
}

export default function ControlPanel({
  onSimulate,
  isLoading,
}: ControlPanelProps) {
  const [apiKey, setApiKey] = useState("");
  const [requests, setRequests] = useState(7);
  const [algorithm, setAlgorithm] = useState<Algorithm>("FIXED_WINDOW");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.length >= 32) {
      onSimulate(apiKey, requests, algorithm);
    }
  };

  const handleGenerateKey = async () => {
    try {
      const response = await fetch("/api/generate");
      const data = await response.json();
      if (data.apikey) {
        setApiKey(data.apikey);
      }
    } catch (error) {
      console.error("Failed to generate API key:", error);
    }
  };

  const selectedAlgo = ALGORITHMS.find((a) => a.id === algorithm);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Configuration
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* API Key Input */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="apiKey"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              API Key
            </label>
            <button
              type="button"
              onClick={handleGenerateKey}
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Generate
            </button>
          </div>
          <input
            id="apiKey"
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="test_api_..."
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-50 dark:focus:ring-zinc-50/10"
          />
          {apiKey.length > 0 && apiKey.length < 32 && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              API key must be at least 32 characters
            </p>
          )}
        </div>

        {/* Algorithm Selector */}
        <div>
          <label
            htmlFor="algorithm"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Algorithm
          </label>
          <select
            id="algorithm"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50/10"
          >
            {ALGORITHMS.map((algo) => (
              <option key={algo.id} value={algo.id}>
                {algo.name}
              </option>
            ))}
          </select>
          {selectedAlgo && (
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              {selectedAlgo.description}
            </p>
          )}
        </div>

        {/* Request Count Slider */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="requests"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Requests to simulate
            </label>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {requests}
            </span>
          </div>
          <input
            id="requests"
            type="range"
            min="1"
            max="10"
            value={requests}
            onChange={(e) => setRequests(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-800"
            style={{
              background: `linear-gradient(to right, #18181b 0%, #18181b ${
                (requests / 10) * 100
              }%, #e4e4e7 ${(requests / 10) * 100}%, #e4e4e7 100%)`,
            }}
          />
          <div className="mt-1.5 flex justify-between text-xs text-zinc-500 dark:text-zinc-500">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || apiKey.length < 32}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className="flex h-11 w-full items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running simulation...
            </>
          ) : (
            "Run Simulation"
          )}
        </motion.button>
      </form>

      {/* How it works */}
      {selectedAlgo && (
        <div className="mt-6 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900/50">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-400">
            How it works
          </h3>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {selectedAlgo.howItWorks}
          </p>
          <a
            href={`/algorithms/${selectedAlgo.id.toLowerCase().replace('_', '-')}`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
          >
            Know more →
          </a>
        </div>
      )}
    </div>
  );
}