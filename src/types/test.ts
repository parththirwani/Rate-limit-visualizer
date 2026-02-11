export type Algorithm = "FIXED_WINDOW" | "SLIDING_WINDOW" | "TOKEN_BUCKET";

export interface AlgorithmMeta {
  id: Algorithm;
  name: string;
  description: string;
  howItWorks: string;
}

export interface SimulationRequest {
  apiKey: string;
  requests: number;
  algorithm: Algorithm;
}

export interface SimulationResult {
  algorithm: Algorithm;
  allowed: number;
  blocked: number;
  total: number;
}

export interface TimelinePoint {
  index: number;
  allowed: boolean;
  remaining: number;
}

export interface VisualizationData {
  allowed: number;
  blocked: number;
  remaining: number;
  timeline: TimelinePoint[];
  throughput: number;
}