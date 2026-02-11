import Navbar from "@/src/components/Navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FixedWindowDemo from "@/src/components/DemoPages/FixedWindowDemo";

export default function FixedWindowPage() {
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
                        Fixed Window Counter
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        The simplest rate limiting algorithm - a counter that resets at fixed intervals
                    </p>
                </div>

                {/* Interactive Demo */}
                <FixedWindowDemo />

                {/* Content */}
                <article className="prose prose-zinc dark:prose-invert max-w-none">
                    <h2>How It Works</h2>
                    <p>
                        The Fixed Window Counter is the most straightforward rate limiting algorithm.
                        It divides time into fixed windows (e.g., 60 seconds) and counts requests within each window.
                    </p>

                    <h3>Algorithm Steps</h3>
                    <ol>
                        <li>Define a time window (e.g., 60 seconds) and a request limit (e.g., 5 requests)</li>
                        <li>When a request arrives, increment the counter for the current window</li>
                        <li>If counter ≤ limit, allow the request</li>
                        <li>If counter &gt; limit, block the request</li>
                        <li>When the window expires, reset the counter to 0</li>
                    </ol>

                    <h3>Implementation</h3>
                    <p>
                        In Redis, this is typically implemented using a simple key-value pair where:
                    </p>
                    <ul>
                        <li>The key is the identifier (e.g., <code>rate:api_key_123</code>)</li>
                        <li>The value is the request count</li>
                        <li>An expiry (TTL) is set for the duration of the window</li>
                    </ul>

                    <pre className="bg-zinc-900 text-zinc-50 p-4 rounded-lg overflow-x-auto">
                        {`const WINDOW = 60; // seconds
const LIMIT = 5;

async function fixedWindowLimiter(apiKey: string) {
  const key = \`rate:\${apiKey}\`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, WINDOW);
  }
  
  return count <= LIMIT;
}`}
                    </pre>

                    <h3>Advantages</h3>
                    <ul>
                        <li><strong>Simple implementation:</strong> Just a counter and expiry</li>
                        <li><strong>Memory efficient:</strong> Only stores one integer per key</li>
                        <li><strong>Fast:</strong> Single Redis operation per request</li>
                        <li><strong>Easy to reason about:</strong> Clear boundaries and limits</li>
                    </ul>

                    <h3>Disadvantages</h3>
                    <ul>
                        <li>
                            <strong>Boundary problem:</strong> Users can make 2× the limit by timing
                            requests at window boundaries (e.g., 5 requests at 0:59, then 5 more at 1:00)
                        </li>
                        <li>
                            <strong>Traffic spikes:</strong> All quota resets at once, potentially
                            causing synchronized bursts
                        </li>
                        <li>
                            <strong>Unfair distribution:</strong> Early requests in a window have
                            advantage over later ones
                        </li>
                    </ul>

                    <h3>Best Use Cases</h3>
                    <ul>
                        <li>Internal APIs where boundary exploitation isn't a concern</li>
                        <li>Systems with relatively low traffic where precision isn't critical</li>
                        <li>Scenarios where simplicity and performance are prioritized</li>
                        <li>Rate limiting for non-critical resources</li>
                    </ul>

                    <h3>Real-World Example</h3>
                    <p>
                        Imagine an API that allows 100 requests per minute. With Fixed Window:
                    </p>
                    <ul>
                        <li>Window starts at 12:00:00</li>
                        <li>User makes 100 requests by 12:00:30</li>
                        <li>All subsequent requests are blocked until 12:01:00</li>
                        <li>At 12:01:00, counter resets and user has full 100 requests again</li>
                    </ul>
                    <p>
                        The problem: user could make 100 requests at 12:00:59 and another 100 at
                        12:01:00, effectively getting 200 requests in 2 seconds.
                    </p>

                    <h3>Variations</h3>
                    <p>
                        Some implementations use multiple windows with different limits:
                    </p>
                    <ul>
                        <li>10 requests per second</li>
                        <li>100 requests per minute</li>
                        <li>1000 requests per hour</li>
                    </ul>
                    <p>
                        This provides protection at multiple time scales but doesn't solve the boundary problem.
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