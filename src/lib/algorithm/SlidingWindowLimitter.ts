import { redis } from "../Redis";


const WINDOW = 60 * 1000; // milliseconds
const LIMIT = 5;

export async function slidingWindowLimiter(apiKey: string) {

    const key = `slide:${apiKey}`;
    const now = Date.now();
    const windowStart = now - WINDOW;

    const pipeline = redis.pipeline();

    // remove expired
    pipeline.zremrangebyscore(key, 0, windowStart);

    pipeline.zcard(key);

    pipeline.zadd(key, {
        score: now,
        member: `${now}-${crypto.randomUUID()}`
    });

    // ensure key expires eventually
    pipeline.expire(key, 60);

    const [, count] = await pipeline.exec();

    const allowed = (count as number) < LIMIT;

    if (!allowed) {
        await redis.zremrangebyrank(key, LIMIT, LIMIT);
    }

    return {
        allowed,
        remaining: Math.max(0, LIMIT - ((count as number) + 1)),
        count: (count as number) + 1
    };
}

export async function loopSlidingRequests(requests: number, apiKey: string) {

    const promises = Array.from(
        { length: requests },
        () => slidingWindowLimiter(apiKey)
    );

    const results = await Promise.all(promises);

    const allowed = results.filter(r => r.allowed).length;
    const blocked = requests - allowed;

    return { allowed, blocked, total: requests };
}
