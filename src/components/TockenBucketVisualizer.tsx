"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TokenBucketVisualizerProps {
  remaining: number;
  capacity?: number;
}

export default function TokenBucketVisualizer({
  remaining,
  capacity = 10,
}: TokenBucketVisualizerProps) {
  const [displayRemaining, setDisplayRemaining] = useState(remaining);

  useEffect(() => {
    setDisplayRemaining(remaining);
  }, [remaining]);

  const fillPercentage = (displayRemaining / capacity) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <h3 className="mb-6 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Token Bucket
      </h3>

      <div className="flex items-end justify-center">
        {/* Bucket container */}
        <div className="relative">
          {/* Bucket outline */}
          <div className="relative h-64 w-48 rounded-b-3xl border-4 border-t-0 border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-900/50">
            {/* Water/tokens fill */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 rounded-b-3xl bg-linear-to-t from-blue-500 to-blue-400 dark:from-blue-600 dark:to-blue-500"
              initial={{ height: `${fillPercentage}%` }}
              animate={{ height: `${fillPercentage}%` }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                mass: 1,
              }}
            />

            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 rounded-b-3xl bg-linear-to-t from-transparent via-white/20 to-transparent"
              animate={{
                y: ["-100%", "100%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Token count overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  key={displayRemaining}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50"
                >
                  {displayRemaining}
                </motion.div>
                <div className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  tokens
                </div>
              </div>
            </div>
          </div>

          {/* Capacity indicator */}
          <div className="mt-4 text-center">
            <div className="text-xs text-zinc-500 dark:text-zinc-500">
              Capacity: {capacity} tokens
            </div>
            <div className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
              {fillPercentage.toFixed(0)}% full
            </div>
          </div>
        </div>
      </div>

      {/* Refill indicator */}
      <div className="mt-6 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
          <p className="text-xs text-zinc-700 dark:text-zinc-300">
            Refilling at 5 tokens/second
          </p>
        </div>
      </div>
    </motion.div>
  );
}