"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TimelinePoint } from "../types/test";


interface TrafficGraphProps {
  timeline: TimelinePoint[];
}

export default function TrafficGraph({ timeline }: TrafficGraphProps) {
  // Transform timeline data for Recharts
  const data = timeline.map((point) => ({
    request: point.index,
    status: point.allowed ? 1 : 0,
    remaining: point.remaining,
    label: point.allowed ? "Allowed" : "Blocked",
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <h3 className="mb-6 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Request Timeline
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.3} />
          <XAxis
            dataKey="request"
            label={{ value: "Request #", position: "insideBottom", offset: -5 }}
            tick={{ fill: "#71717a", fontSize: 12 }}
            stroke="#d4d4d8"
          />
          <YAxis
            label={{ value: "Status", angle: -90, position: "insideLeft" }}
            tick={{ fill: "#71717a", fontSize: 12 }}
            stroke="#d4d4d8"
            domain={[0, 1]}
            ticks={[0, 1]}
            tickFormatter={(value) => (value === 1 ? "Allow" : "Block")}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#fafafa", fontWeight: 600 }}
            itemStyle={{ color: "#a1a1aa" }}
            formatter={(value: any, name: string | undefined, props: any) => {
              if (name === "status") {
                return [props.payload.label, "Status"];
              }
              return [value, name || ""]; 
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
            iconType="circle"
          />
          <Line
            type="stepAfter"
            dataKey="status"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
            name="Request Status"
          />
          <Line
            type="monotone"
            dataKey="remaining"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Remaining Quota"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center gap-6 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
          <span>Request status (1 = allowed, 0 = blocked)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 border-t-2 border-dashed border-amber-500"></div>
          <span>Remaining quota</span>
        </div>
      </div>
    </motion.div>
  );
}