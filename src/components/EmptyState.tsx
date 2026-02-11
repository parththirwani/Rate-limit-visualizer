"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-150 items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-900/30"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-4 inline-flex rounded-full bg-zinc-200 p-4 dark:bg-zinc-800"
        >
          <Activity className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
        </motion.div>
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Ready to simulate
        </h3>
        <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          Configure your parameters on the left and run a simulation to see how
          different rate limiting algorithms behave.
        </p>
      </div>
    </motion.div>
  );
}