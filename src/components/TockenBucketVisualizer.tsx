"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface TokenBucketVisualizerProps {
  remaining: number;
  capacity?: number;
}

interface TokenDrop {
  id: string;
  startTime: number;
}

export default function TokenBucketVisualizer({
  remaining,
  capacity = 10,
}: TokenBucketVisualizerProps) {
  const [displayRemaining, setDisplayRemaining] = useState(0);
  const [drops, setDrops] = useState<TokenDrop[]>([]);

  const refillIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tokenCounterRef = useRef(0);
  const isInitializedRef = useRef(false);

  // ────────────────────────────────────────────────
  // 1. Mount / unmount logic
  // ────────────────────────────────────────────────
  useEffect(() => {
    isInitializedRef.current = true;
    setDisplayRemaining(0);
    setDrops([]);
    tokenCounterRef.current = 0;

    return () => {
      if (refillIntervalRef.current) {
        clearInterval(refillIntervalRef.current);
      }
      isInitializedRef.current = false;
    };
  }, []);

  // ────────────────────────────────────────────────
  // 2. Auto-refill simulation (1 token/second)
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (!isInitializedRef.current) return;

    // Clear previous interval if exists
    if (refillIntervalRef.current) {
      clearInterval(refillIntervalRef.current);
    }

    refillIntervalRef.current = setInterval(() => {
      setDisplayRemaining((prev) => {
        const newValue = Math.min(capacity, prev + 1);

        if (newValue > prev) {
          // Trigger drop animation
          tokenCounterRef.current += 1;
          const uniqueId = `auto-${Date.now()}-${tokenCounterRef.current}-${Math.random()
            .toString(36)
            .slice(2, 10)}`;

          setDrops((prevDrops) => {
            // Keep only last 5–6 drops to prevent memory buildup
            const filtered = prevDrops.length > 6 ? prevDrops.slice(-6) : prevDrops;
            return [...filtered, { id: uniqueId, startTime: Date.now() }];
          });

          // Auto-remove drop after animation
          setTimeout(() => {
            setDrops((prev) => prev.filter((d) => d.id !== uniqueId));
          }, 1800);
        }

        return newValue;
      });
    }, 1000);

    return () => {
      if (refillIntervalRef.current) {
        clearInterval(refillIntervalRef.current);
      }
    };
  }, [capacity]);

  // ────────────────────────────────────────────────
  // 3. Sync with external "remaining" value (from API / parent)
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (!isInitializedRef.current) return;
    setDisplayRemaining((prev) => {
      // Only update if meaningfully different (prevents render loops)
      if (Math.abs(remaining - prev) > 0.01) {
        return remaining;
      }
      return prev;
    });
  }, [remaining]);

  const fillPercentage = (displayRemaining / capacity) * 100;
  const isFull = displayRemaining >= capacity;

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
          {/* Falling drops area */}
          <div className="absolute -top-32 left-0 right-0 h-32 overflow-hidden">
            <AnimatePresence>
              {drops.map((drop) => (
                <motion.div
                  key={drop.id}
                  initial={{ y: -40, opacity: 0, scale: 0 }}
                  animate={{
                    y: 160,
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1.2, 1, 0.8],
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    duration: 1.2,
                    ease: [0.34, 1.56, 0.64, 1],
                    times: [0, 0.2, 0.8, 1],
                  }}
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    left: `${50 + (Math.random() - 0.5) * 24}%`,
                  }}
                >
                  <div
                    className={`h-4 w-4 rounded-full shadow-lg ${
                      isFull
                        ? "bg-red-400 dark:bg-red-500"
                        : "bg-blue-400 dark:bg-blue-500"
                    }`}
                  >
                    <div
                      className={`h-full w-full animate-ping rounded-full opacity-75 ${
                        isFull ? "bg-red-300" : "bg-blue-300"
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Bucket */}
          <div
            className={`relative h-64 w-48 overflow-hidden rounded-b-3xl border-4 border-t-0 ${
              isFull
                ? "border-red-400 bg-red-50/50 dark:border-red-600 dark:bg-red-950/30"
                : "border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-900/50"
            }`}
          >
            {/* Liquid / tokens fill */}
            <motion.div
              className={`absolute bottom-0 left-0 right-0 rounded-b-3xl ${
                isFull
                  ? "bg-linear-to-t from-red-500 to-red-400 dark:from-red-600 dark:to-red-500"
                  : "bg-linear-to-t from-blue-500 to-blue-400 dark:from-blue-600 dark:to-blue-500"
              }`}
              animate={{ height: `${fillPercentage}%` }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                mass: 1,
              }}
            >
              {/* Wave animation */}
              <div className="absolute left-0 right-0 top-0 h-2">
                <motion.div
                  className={`h-full w-full opacity-40 ${
                    isFull ? "bg-red-300 dark:bg-red-400" : "bg-blue-300 dark:bg-blue-400"
                  }`}
                  animate={{
                    scaleX: [1, 1.12, 1],
                    opacity: [0.4, 0.65, 0.4],
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>

            {/* Shimmer pass */}
            <motion.div
              className="absolute inset-0 rounded-b-3xl bg-linear-to-t from-transparent via-white/20 to-transparent"
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            />

            {/* Number overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  key={displayRemaining}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className={`text-5xl font-bold tabular-nums drop-shadow-lg ${
                    isFull ? "text-red-900 dark:text-red-50" : "text-zinc-900 dark:text-zinc-50"
                  }`}
                  style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
                >
                  {displayRemaining}
                </motion.div>
                <div
                  className={`mt-1 text-sm font-medium ${
                    isFull ? "text-red-700 dark:text-red-300" : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  tokens
                </div>
              </div>
            </div>
          </div>

          {/* Capacity label */}
          <div className="mt-4 text-center">
            <div className="text-xs text-zinc-500 dark:text-zinc-500">
              Capacity: {capacity} tokens
            </div>
            <div
              className={`mt-1 text-xs font-semibold ${
                isFull ? "text-red-600 dark:text-red-400" : "text-zinc-400 dark:text-zinc-600"
              }`}
            >
              {isFull ? "FULL" : `${fillPercentage.toFixed(0)}% full`}
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div
        className={`mt-6 rounded-lg p-3 ${
          isFull ? "bg-red-50 dark:bg-red-950/30" : "bg-blue-50 dark:bg-blue-950/30"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isFull ? "bg-red-500" : "bg-blue-500 animate-pulse"
            }`}
          />
          <p
            className={`text-xs ${
              isFull ? "text-red-700 dark:text-red-300" : "text-zinc-700 dark:text-zinc-300"
            }`}
          >
            {isFull ? "Bucket is full – no more refills" : "Refilling at 1 token/second"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}