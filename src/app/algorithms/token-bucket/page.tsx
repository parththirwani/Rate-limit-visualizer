import Navbar from "@/src/components/Navbar";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TokenBucketDemo from "@/src/components/DemoPages/TokenBucketDemo";

export default function TokenBucketPage() {
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
                        Token Bucket
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        Flexible rate limiting with burst capacity and smooth refill
                    </p>
                </div>

                {/* Interactive Demo */}
                <TokenBucketDemo />

                {/* Content */}
                <article className="prose prose-zinc dark:prose-invert max-w-none">
                    <h2>How It Works</h2>
                    <p>
                        The Token Bucket algorithm imagines a bucket that holds tokens. Each request
                        consumes one token. The bucket has a maximum capacity and refills at a constant
                        rate. This allows controlled bursts while maintaining an average rate over time.
                    </p>

                    <h3>Algorithm Steps</h3>
                    <ol>
                        <li>Initialize a bucket with maximum capacity (e.g., 10 tokens)</li>
                        <li>Define a refill rate (e.g., 5 tokens per second)</li>
                        <li>When a request arrives:
                            <ul>
                                <li>Calculate time elapsed since last refill</li>
                                <li>Add tokens based on elapsed time × refill rate</li>
                                <li>Cap tokens at maximum capacity</li>
                            </ul>
                        </li>
                        <li>If bucket has ≥1 token, consume it and allow request</li>
                        <li>If bucket is empty, reject request</li>
                        <li>Store updated token count and timestamp</li>
                    </ol>

                    <h3>Implementation</h3>
                    <p>
                        Redis hash is ideal for storing bucket state:
                    </p>
                    <ul>
                        <li>Store current token count</li>
                        <li>Store last refill timestamp</li>
                        <li>Calculate refill on each request</li>
                    </ul>

                    <pre className="bg-zinc-900 text-zinc-50 p-4 rounded-lg overflow-x-auto">
                        {`const BUCKET_SIZE = 10;
const REFILL_RATE = 5; // tokens per second

async function tokenBucketLimiter(apiKey: string) {
  const key = \`bucket:\${apiKey}\`;
  const now = Date.now();
  
  // Get existing bucket state
  const bucket = await redis.hgetall(key);
  
  let tokens = BUCKET_SIZE;
  let lastRefill = now;
  
  if (bucket?.tokens && bucket?.lastRefill) {
    tokens = parseFloat(bucket.tokens);
    lastRefill = parseInt(bucket.lastRefill);
    
    // Calculate refill
    const elapsed = (now - lastRefill) / 1000;
    const refill = elapsed * REFILL_RATE;
    tokens = Math.min(BUCKET_SIZE, tokens + refill);
  }
  
  let allowed = false;
  if (tokens >= 1) {
    tokens -= 1;
    allowed = true;
  }
  
  // Save updated state
  await redis.hset(key, {
    tokens: tokens.toString(),
    lastRefill: now.toString()
  });
  
  await redis.expire(key, 120);
  
  return allowed;
}`}
                    </pre>

                    <h3>Key Concepts</h3>

                    <h4>Bucket Capacity vs Refill Rate</h4>
                    <p>
                        The algorithm has two independent parameters:
                    </p>
                    <ul>
                        <li><strong>Capacity:</strong> Maximum burst size (tokens in bucket)</li>
                        <li><strong>Refill rate:</strong> Average sustained rate (tokens/second)</li>
                    </ul>
                    <p>
                        Example: Capacity=100, Rate=10/sec means:
                    </p>
                    <ul>
                        <li>User can burst 100 requests immediately</li>
                        <li>Then limited to 10 requests/second</li>
                        <li>After 10 seconds of inactivity, back to 100 tokens</li>
                    </ul>

                    <h4>Burst Handling</h4>
                    <p>
                        Token Bucket excels at handling legitimate bursts:
                    </p>
                    <ul>
                        <li>User inactive for 1 minute → bucket fills to capacity</li>
                        <li>Sudden spike of requests → bucket absorbs burst</li>
                        <li>Sustained high rate → limited by refill rate</li>
                    </ul>

                    <h3>Advantages</h3>
                    <ul>
                        <li><strong>Burst allowance:</strong> Natural support for bursty traffic patterns</li>
                        <li><strong>Smooth rate limiting:</strong> Gradual refill prevents hard resets</li>
                        <li><strong>Flexible configuration:</strong> Independent control of burst and rate</li>
                        <li><strong>Memory efficient:</strong> Only stores 2 values per key</li>
                        <li><strong>No boundary problem:</strong> Continuous refill, no synchronized resets</li>
                    </ul>

                    <h3>Disadvantages</h3>
                    <ul>
                        <li>
                            <strong>Complexity:</strong> More complex than fixed window (time calculations)
                        </li>
                        <li>
                            <strong>Race conditions:</strong> Requires atomic operations for correctness
                        </li>
                        <li>
                            <strong>Tuning difficulty:</strong> Two parameters to configure correctly
                        </li>
                        <li>
                            <strong>Starvation possibility:</strong> Continuous requests can keep bucket near empty
                        </li>
                    </ul>

                    <h3>Best Use Cases</h3>
                    <ul>
                        <li>APIs with naturally bursty traffic (mobile apps, webhooks)</li>
                        <li>Systems where user experience depends on burst capacity</li>
                        <li>Network traffic shaping and QoS</li>
                        <li>Media streaming and download services</li>
                        <li>Background job processing systems</li>
                    </ul>

                    <h3>Real-World Examples</h3>

                    <h4>Example 1: API Gateway</h4>
                    <p>
                        An API allows bursts of 50 requests but averages 10 requests/second:
                    </p>
                    <ul>
                        <li>Capacity: 50 tokens</li>
                        <li>Refill: 10 tokens/second</li>
                        <li>User can make 50 requests instantly</li>
                        <li>Then limited to 10/second sustained</li>
                        <li>After 5 seconds idle, regains full 50 tokens</li>
                    </ul>

                    <h4>Example 2: Network Bandwidth</h4>
                    <p>
                        Classic use case from computer networking:
                    </p>
                    <ul>
                        <li>Capacity: 1MB (burst size)</li>
                        <li>Refill: 100KB/second (sustained throughput)</li>
                        <li>Allows large file uploads in bursts</li>
                        <li>Maintains average bandwidth limit</li>
                    </ul>

                    <h3>Variations</h3>

                    <h4>Leaky Bucket</h4>
                    <p>
                        Similar concept but different behavior:
                    </p>
                    <ul>
                        <li>Requests queue in the bucket</li>
                        <li>Process requests at constant rate (leak)</li>
                        <li>Overflow causes rejection</li>
                        <li>Results in perfectly smooth output rate</li>
                    </ul>

                    <h4>Hierarchical Token Bucket</h4>
                    <p>
                        Multiple buckets for different time scales:
                    </p>
                    <pre className="bg-zinc-900 text-zinc-50 p-4 rounded-lg overflow-x-auto">
                        {`const buckets = [
  { capacity: 10, rate: 10, window: "second" },
  { capacity: 100, rate: 100, window: "minute" },
  { capacity: 1000, rate: 1000, window: "hour" }
];

// Request allowed only if ALL buckets have tokens`}
                    </pre>

                    <h3>Configuration Guidelines</h3>
                    <p>
                        How to choose capacity and refill rate:
                    </p>
                    <ul>
                        <li>
                            <strong>Capacity:</strong> Set to expected burst size
                            <ul>
                                <li>Mobile app startup: 20-50 requests</li>
                                <li>Web page load: 10-30 requests</li>
                                <li>Background sync: 100+ requests</li>
                            </ul>
                        </li>
                        <li>
                            <strong>Refill rate:</strong> Set to desired average throughput
                            <ul>
                                <li>Free tier: 10 requests/second</li>
                                <li>Paid tier: 100 requests/second</li>
                                <li>Internal service: 1000+ requests/second</li>
                            </ul>
                        </li>
                        <li>
                            <strong>Refill time:</strong> Capacity ÷ Rate = time to refill empty bucket
                            <ul>
                                <li>Fast refill (10 tokens, 5/sec): 2 seconds</li>
                                <li>Slow refill (100 tokens, 10/sec): 10 seconds</li>
                            </ul>
                        </li>
                    </ul>

                    <h3>Production Considerations</h3>
                    <ul>
                        <li>
                            <strong>Fractional tokens:</strong> Store as float for sub-second precision
                        </li>
                        <li>
                            <strong>Clock skew:</strong> Use monotonic time or server timestamps
                        </li>
                        <li>
                            <strong>Distributed systems:</strong> May need distributed locks or consensus
                        </li>
                        <li>
                            <strong>Monitoring:</strong> Track bucket fill levels to detect attacks
                        </li>
                    </ul>

                    <h3>Comparison with Other Algorithms</h3>
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th>Fixed Window</th>
                                <th>Sliding Window</th>
                                <th>Token Bucket</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Burst handling</td>
                                <td>Poor</td>
                                <td>None</td>
                                <td>Excellent</td>
                            </tr>
                            <tr>
                                <td>Memory usage</td>
                                <td>Minimal</td>
                                <td>High</td>
                                <td>Minimal</td>
                            </tr>
                            <tr>
                                <td>Boundary problem</td>
                                <td>Yes</td>
                                <td>No</td>
                                <td>No</td>
                            </tr>
                            <tr>
                                <td>Implementation</td>
                                <td>Simple</td>
                                <td>Complex</td>
                                <td>Medium</td>
                            </tr>
                            <tr>
                                <td>Best for</td>
                                <td>Simple limits</td>
                                <td>Precise limits</td>
                                <td>Bursty traffic</td>
                            </tr>
                        </tbody>
                    </table>
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