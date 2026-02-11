"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Clock } from "lucide-react";

export default function FixedWindowDemo() {
  const [requests, setRequests] = useState(0);
  const [windowTime, setWindowTime] = useState(60);
  const [limit, setLimit] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [requestLog, setRequestLog] = useState<{ id: number; allowed: boolean; time: number }[]>([]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          // Reset window
          setRequests(0);
          setRequestLog([]);
          return windowTime;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, windowTime]);

  const handleRequest = () => {
    const allowed = requests < limit;
    const newRequest = {
      id: Date.now(),
      allowed,
      time: windowTime - timeLeft,
    };

    setRequestLog((prev) => [...prev, newRequest]);
    
    if (allowed) {
      setRequests((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setRequests(0);
    setTimeLeft(windowTime);
    setRequestLog([]);
    setIsRunning(false);
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const progress = ((windowTime - timeLeft) / windowTime) * 100;
  const usagePercent = (requests / limit) * 100;

  return (
    <div className="mb-12 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Interactive Demo
      </h2>

      {/* Controls */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Window Duration (seconds)
          </label>
          <input
            type="number"
            value={windowTime}
            onChange={(e) => setWindowTime(Number(e.target.value))}
            disabled={isRunning}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
            min="10"
            max="120"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Request Limit
          </label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            disabled={isRunning}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
            min="1"
            max="20"
          />
        </div>
        <div className="flex items-end gap-2">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Play className="h-4 w-4" />
              Start Window
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-600 px-4 text-sm font-medium text-white hover:bg-zinc-700"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Window Progress */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Window Progress
            </span>
          </div>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {timeLeft}s remaining
          </span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Request Counter */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
            Requests Used
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {requests} / {limit}
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className={`h-full transition-all ${
                requests >= limit ? "bg-red-500" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-center">
          <button
            onClick={handleRequest}
            disabled={!isRunning}
            className="h-full w-full rounded-lg bg-emerald-600 px-6 text-lg font-semibold text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Make Request
          </button>
        </div>
      </div>

      {/* Request Log */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Request Log
        </h3>
        <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <AnimatePresence>
            {requestLog.length === 0 ? (
              <div className="text-center text-sm text-zinc-500">
                No requests yet. Click "Make Request" to start.
              </div>
            ) : (
              [...requestLog].reverse().map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                    req.allowed
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
                  }`}
                >
                  <span className="font-medium">
                    {req.allowed ? "✓ Allowed" : "✗ Blocked"}
                  </span>
                  <span className="text-xs opacity-75">at {req.time}s</span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          <strong>Try this:</strong> Make {limit} requests, then try another. It will be blocked. 
          Wait for the window to reset, and the counter goes back to 0. Notice how all requests 
          reset at once - this is the "boundary problem" of fixed windows.
        </p>
      </div>
    </div>
  );
}