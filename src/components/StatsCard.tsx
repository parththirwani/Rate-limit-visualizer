"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Zap } from "lucide-react";

interface StatsCardsProps {
  allowed: number;
  blocked: number;
  remaining: number;
  throughput: number;
}

const statCards = [
  {
    key: "allowed",
    label: "Allowed",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    key: "blocked",
    label: "Blocked",
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
  },
  {
    key: "remaining",
    label: "Remaining",
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    key: "throughput",
    label: "Throughput",
    icon: Zap,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
];

export default function StatsCards({
  allowed,
  blocked,
  remaining,
  throughput,
}: StatsCardsProps) {
  const values: Record<string, number | string> = {
    allowed,
    blocked,
    remaining,
    throughput: `${throughput.toFixed(1)}%`,
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                  {stat.label}
                </p>
                <motion.p
                  key={values[stat.key]}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50"
                >
                  {values[stat.key]}
                </motion.p>
              </div>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}