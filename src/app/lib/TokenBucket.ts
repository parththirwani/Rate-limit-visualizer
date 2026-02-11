import { redis } from "./Redis";

const BUCKET_SIZE = 10;
const REFILL_RATE = 5; 

export async function tokenBucketLimiter(apiKey: string) {

    const key = `bucket:${apiKey}`;
    const now = Date.now();

    // get existing bucket
    const bucket = await redis.hgetall<{
        tokens: string;
        lastRefill: string;
    }>(key);

    let tokens = BUCKET_SIZE;
    let lastRefill = now;

    if (bucket?.tokens && bucket?.lastRefill) {

        tokens = parseFloat(bucket.tokens);
        lastRefill = parseInt(bucket.lastRefill);

        const elapsed = (now - lastRefill) / 1000; 
        const refill = elapsed * REFILL_RATE;

        tokens = Math.min(BUCKET_SIZE, tokens + refill);
    }

    let allowed = false;

    if (tokens >= 1) {
        tokens -= 1;
        allowed = true;
    }

    // save updated bucket
    await redis.hset(key, {
        tokens: tokens.toString(),
        lastRefill: now.toString()
    });

    // auto cleanup
    await redis.expire(key, 120);

    return {
        allowed,
        remaining: Math.floor(tokens),
        tokens
    };
}

export async function loopTokenRequests(
    requests: number,
    apiKey: string
) {

    const results = await Promise.all(
        Array.from(
            { length: requests },
            () => tokenBucketLimiter(apiKey)
        )
    );

    const allowed = results.filter(r => r.allowed).length;
    const blocked = requests - allowed;

    return { allowed, blocked };
}

