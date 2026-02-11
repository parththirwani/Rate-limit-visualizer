import Navbar from "@/src/components/Navbar";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SlidingWindowDemo from "@/src/components/DemoPages/SlidingWindowDemo";

export default function SlidingWindowPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Visualizer
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Sliding Window Log
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Precise rate limiting using a rolling time window with timestamp tracking
          </p>
        </div>

        {/* Interactive Demo */}
        <SlidingWindowDemo />

        {/* Content */}
        <article className="prose prose-zinc dark:prose-invert max-w-none">
          <h2>How It Works</h2>
          <p>
            The Sliding Window Log algorithm maintains a log of timestamps for each request.
            It continuously removes expired timestamps and counts only requests within the
            current rolling window, providing precise rate limiting without boundary issues.
          </p>

          <h3>Algorithm Steps</h3>
          <ol>
            <li>Define a time window duration (e.g., 60 seconds) and request limit (e.g., 5)</li>
            <li>When a request arrives, calculate the window start time (now - window duration)</li>
            <li>Remove all timestamps older than the window start</li>
            <li>Count remaining timestamps in the log</li>
            <li>If count &lt; limit, add current timestamp and allow request</li>
            <li>If count ≥ limit, reject request</li>
          </ol>

          <h3>Implementation</h3>
          <p>
            Redis Sorted Sets are perfect for this algorithm:
          </p>
          <ul>
            <li>Timestamps are stored as scores</li>
            <li>Unique request IDs are stored as members</li>
            <li><code>ZREMRANGEBYSCORE</code> efficiently removes expired entries</li>
            <li><code>ZCARD</code> counts current entries</li>
          </ul>

          <pre className="bg-zinc-900 text-zinc-50 p-4 rounded-lg overflow-x-auto">
            {`const WINDOW = 60 * 1000; // milliseconds
const LIMIT = 5;

async function slidingWindowLimiter(apiKey: string) {
  const key = \`slide:\${apiKey}\`;
  const now = Date.now();
  const windowStart = now - WINDOW;
  
  const pipeline = redis.pipeline();
  
  // Remove expired timestamps
  pipeline.zremrangebyscore(key, 0, windowStart);
  
  // Count current requests
  pipeline.zcard(key);
  
  // Add new timestamp
  pipeline.zadd(key, {
    score: now,
    member: \`\${now}-\${crypto.randomUUID()}\`
  });
  
  pipeline.expire(key, 60);
  
  const [, count] = await pipeline.exec();
  
  return (count as number) < LIMIT;
}`}
          </pre>

          <h3>Advantages</h3>
          <ul>
            <li><strong>Precise enforcement:</strong> No boundary problem - the window truly rolls</li>
            <li><strong>Fair distribution:</strong> Requests are evaluated based on exact timing</li>
            <li><strong>No synchronized bursts:</strong> Each user has their own rolling window</li>
            <li><strong>Accurate metrics:</strong> You know exactly when requests occurred</li>
          </ul>

          <h3>Disadvantages</h3>
          <ul>
            <li>
              <strong>Memory overhead:</strong> Must store a timestamp for every request
              within the window (can be significant at high traffic)
            </li>
            <li>
              <strong>Computational cost:</strong> Must clean up expired entries on every request
            </li>
            <li>
              <strong>Write amplification:</strong> Each request writes to the log
            </li>
            <li>
              <strong>Complexity:</strong> More complex than fixed window
            </li>
          </ul>

          <h3>Memory Considerations</h3>
          <p>
            If your limit is 1000 requests per minute and you have 10,000 active users:
          </p>
          <ul>
            <li>Worst case: 10,000 users × 1000 requests = 10 million timestamps</li>
            <li>Each timestamp: ~40-50 bytes (score + member + overhead)</li>
            <li>Total memory: ~400-500 MB just for rate limiting</li>
          </ul>
          <p>
            This scales linearly with both users and request limits.
          </p>

          <h3>Best Use Cases</h3>
          <ul>
            <li>Public APIs where precise limits are critical</li>
            <li>Payment or financial systems requiring exact enforcement</li>
            <li>Services where fairness matters (preventing gaming of the system)</li>
            <li>Lower traffic APIs where memory isn't a constraint</li>
            <li>Systems requiring audit trails of requests</li>
          </ul>

          <h3>Real-World Example</h3>
          <p>
            An API allows 100 requests per minute. At 12:00:30, a user has made 80 requests
            in the past minute. With Sliding Window:
          </p>
          <ul>
            <li>System looks back exactly 60 seconds to 11:59:30</li>
            <li>Counts all requests between 11:59:30 and 12:00:30</li>
            <li>Finds 80 requests, allows the new one (81/100)</li>
            <li>At 12:00:31, window slides to 11:59:31-12:00:31</li>
            <li>Old requests automatically fall out of the window</li>
          </ul>

          <h3>Optimizations</h3>
          <p>
            Several optimizations can reduce memory usage:
          </p>
          <ul>
            <li>
              <strong>Hybrid approach:</strong> Use fixed window buckets with sliding
              window math (weighted combination)
            </li>
            <li>
              <strong>Sampling:</strong> Only log every Nth request and multiply counts
            </li>
            <li>
              <strong>Compression:</strong> Use bitmap or bloom filter approximations
            </li>
            <li>
              <strong>Lazy cleanup:</strong> Only clean old entries when nearing limit
            </li>
          </ul>

          <h3>The Sliding Window Counter Variant</h3>
          <p>
            A popular hybrid uses two fixed windows and weights them:
          </p>
          <pre className="bg-zinc-900 text-zinc-50 p-4 rounded-lg overflow-x-auto">
            {`// Example: 30 seconds into current minute
const previousWindowWeight = 0.5; // 50% through
const currentCount = 10;
const previousCount = 80;

const estimated = 
  (previousCount * (1 - previousWindowWeight)) + 
  currentCount;

// estimated = (80 * 0.5) + 10 = 50 requests
const allowed = estimated < LIMIT;`}
          </pre>
          <p>
            This provides better boundary protection than fixed window while using
            constant memory (just two counters).
          </p>
        </article>
      </main>

      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-zinc-500">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Back to Rate Limit Visualizer
          </Link>
        </div>
      </footer>
    </div>
  );
}