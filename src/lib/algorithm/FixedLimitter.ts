import { redis } from "../Redis";

const WINDOW = 60; // seconds
const LIMIT = 5;

export async function fixedWindowLimiter(apiKey: string) {
    const key = `rate:${apiKey}`;

    const count = await redis.incr(key);

    // first request → set expiry
    if (count === 1) {
        await redis.expire(key, WINDOW);
    }

    const allowed = count <= LIMIT;

    return {
        allowed,
        remaining: Math.max(0, LIMIT - count),
        count
    };
}

export async function loopFixedRequests(requests: number, apiKey: string) {

    const promises = Array.from({ length: requests }, () =>
        fixedWindowLimiter(apiKey)
    );

    const results = await Promise.all(promises);

    const allowed = results.filter(r => r.allowed).length;
    const blocked = requests - allowed;

    return { allowed, blocked, total: requests };
}


