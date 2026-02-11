"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Algorithm } from "../types/test";
import { Clock } from "lucide-react";

interface AlgorithmTimerProps {
  algorithm: Algorithm;
}

export default function AlgorithmTimer({ algorithm }: AlgorithmTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [windowProgress, setWindowProgress] = useState(0);

  useEffect(() => {
    // Reset everything when component mounts (triggered by key change)
    setElapsed(0);
    setWindowProgress(0);

    const startTime = Date.now();
    const windowDuration = algorithm === "TOKEN_BUCKET" ? 1000 : 60000; // 1s for bucket, 60s for windows

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - startTime;
      setElapsed(diff);

      // Calculate progress within current window
      const progress = (diff % windowDuration) / windowDuration;
      setWindowProgress(progress * 100);
    }, 50);

    return () => clearInterval(interval);
  }, [algorithm]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    return `${seconds}.${Math.floor(milliseconds / 100)}s`;
  };

  const colorClasses = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    emerald: "bg-emerald-500",
  } as const;

  type ColorKey = keyof typeof colorClasses;

  const getTimerConfig = (): {
    title: string;
    description: string;
    duration: number;
    color: ColorKey;
  } => {
    switch (algorithm) {
      case "FIXED_WINDOW":
        return {
          title: "Window Timer",
          description: "Resets every 60 seconds",
          duration: 60000,
          color: "blue" as const,
        };
      case "SLIDING_WINDOW":
        return {
          title: "Sliding Window",
          description: "Rolling 60-second window",
          duration: 60000,
          color: "purple" as const,
        };
      case "TOKEN_BUCKET":
        return {
          title: "Refill Timer",
          description: "Refills 1 token/second",
          duration: 1000,
          color: "emerald" as const,
        };
    }
  };

  const config = getTimerConfig();
  const defaultLimit = algorithm === "TOKEN_BUCKET" ? 10 : 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {config.title}
          </h3>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            {config.description}
          </p>
          <p className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">
            Default Limit: {defaultLimit} {algorithm === "TOKEN_BUCKET" ? "tokens" : "requests"}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-100 p-2 dark:bg-zinc-900">
          <Clock className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3 h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <motion.div
          className={`h-full ${colorClasses[config.color]}`}
          initial={{ width: "0%" }}
          animate={{ width: `${windowProgress}%` }}
          transition={{ duration: 0.05, ease: "linear" }}
        />
      </div>

      {/* Time Display */}
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
          {formatTime(elapsed % config.duration)}
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-500">
          / {config.duration / 1000}s
        </span>
      </div>

      {/* Additional info for TOKEN_BUCKET */}
      {algorithm === "TOKEN_BUCKET" && (
        <div className="mt-4 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300">
              Next refill: {formatTime(1000 - (elapsed % 1000))}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}