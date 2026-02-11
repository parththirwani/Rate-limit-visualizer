# Rate Limit Visualizer

A Next.js application for understanding and visualizing rate limiting algorithms used in production systems.

## Overview

This project helps developers learn how different rate limiting algorithms work through interactive simulations and real Redis-backed implementations. It demonstrates three core algorithms: Fixed Window Counter, Sliding Window Log, and Token Bucket.

## Features

**Main Visualizer**
- Generate API keys for testing
- Configure request count (1-10 requests)
- Select algorithm (Fixed Window, Sliding Window, Token Bucket)
- Run simulations against Redis-backed rate limiters
- View real-time statistics (allowed, blocked, remaining, throughput)
- Visualize request timeline with charts
- Algorithm-specific visualizations (timer displays, token bucket animation)

**Algorithm Pages**
- Dedicated page for each algorithm with comprehensive documentation
- Interactive demos to experiment with algorithm parameters
- Step-by-step explanations of how each algorithm works
- Code examples with Redis implementation
- Pros, cons, and best use cases
- Real-world examples and configuration guidelines

## Algorithms

**Fixed Window Counter**
Simple counter that resets at fixed intervals. Memory efficient but susceptible to boundary exploitation where users can make 2x requests by timing them at window edges.

**Sliding Window Log**
Maintains timestamps for each request in a rolling window. Provides precise enforcement without boundary issues but uses more memory as it stores individual timestamps.

**Token Bucket**
Bucket that holds tokens and refills at a constant rate. Excellent for handling burst traffic while maintaining average rate limits over time. Configurable capacity and refill rate.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Redis (Upstash) for state persistence
- Tailwind CSS for styling
- Framer Motion for animations
- Recharts for data visualization
- Zod for validation

## Project Structure

```
src/
├── app/
│   ├── algorithms/
│   │   ├── fixed-window/page.tsx
│   │   ├── sliding-window/page.tsx
│   │   └── token-bucket/page.tsx
│   ├── api/
│   │   ├── generate/route.ts (API key generation)
│   │   └── test/route.ts (simulation endpoint)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── algorithms/
│   │   ├── FixedWindowDemo.tsx
│   │   ├── SlidingWindowDemo.tsx
│   │   └── TokenBucketDemo.tsx
│   ├── AlgorithmTimer.tsx
│   ├── ControlPannel.tsx
│   ├── EmptyState.tsx
│   ├── Navbar.tsx
│   ├── StatsCard.tsx
│   ├── TokenBucketVisualizer.tsx
│   ├── TrafficGraph.tsx
│   └── VisualizerClient.tsx
├── lib/
│   ├── algorithm/
│   │   ├── FixedLimitter.ts
│   │   ├── SlidingWindowLimitter.ts
│   │   ├── TokenBucket.ts
│   │   └── metadata.ts
│   ├── Mockapi.ts
│   ├── Realapi.ts
│   └── Redis.ts
├── schema/
│   └── test.ts
└── types/
    └── test.ts
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```env
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

3. Run development server:
```bash
npm run dev
```

4. Open http://localhost:3000

## How It Works

**Backend**
Each algorithm is implemented as a separate rate limiter in Redis:
- Fixed Window: Uses INCR with EXPIRE for simple counter
- Sliding Window: Uses Sorted Sets (ZADD, ZREMRANGEBYSCORE) for timestamp tracking
- Token Bucket: Uses Hash (HGETALL, HSET) to store tokens and last refill time

**Frontend**
The visualizer makes POST requests to `/api/test` with apiKey, requests count, and algorithm choice. Results are displayed through charts, stats cards, and algorithm-specific visualizations.

**State Persistence**
All rate limiting state persists in Redis between requests, simulating real production behavior.

## Use Cases

This tool is useful for:
- Learning rate limiting concepts
- Understanding algorithm tradeoffs
- Debugging rate limiting behavior
- Demonstrating rate limiting to teams
- Comparing algorithm performance characteristics

## License

MIT