import { AlgorithmMeta } from "@/src/types/test";


export const ALGORITHMS: AlgorithmMeta[] = [
  {
    id: "FIXED_WINDOW",
    name: "Fixed Window",
    description: "Simple counter reset at fixed intervals",
    howItWorks: "Counts requests in fixed time windows. Resets completely when window expires.",
  },
  {
    id: "SLIDING_WINDOW",
    name: "Sliding Window",
    description: "Precise rolling time window tracking",
    howItWorks: "Tracks exact timestamps. Removes expired requests continuously for accurate limits.",
  },
  {
    id: "TOKEN_BUCKET",
    name: "Token Bucket",
    description: "Refilling bucket with smooth rate limiting",
    howItWorks: "Bucket holds tokens. Requests consume tokens. Bucket refills at constant rate.",
  },
];

export const getAlgorithmMeta = (id: string) => {
  return ALGORITHMS.find((algo) => algo.id === id);
};