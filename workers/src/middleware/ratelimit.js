/**
 * Rate Limiting Middleware
 * Uses Cloudflare KV for distributed rate limiting
 */

export function rateLimitMiddleware(options = {}) {
    const {
        windowMs = 60000, // 1 minute
        max = 100, // 100 requests per window
        keyGenerator = (c) => c.req.header('CF-Connecting-IP') || 'unknown',
    } = options;

    return async (c, next) => {
        const key = `ratelimit:${keyGenerator(c)}`;
        const now = Date.now();
        const windowStart = now - windowMs;

        try {
            // Get current count from KV
            const data = await c.env.SESSIONS.get(key, 'json');

            let requests = data?.requests || [];

            // Filter out old requests
            requests = requests.filter(timestamp => timestamp > windowStart);

            // Check if limit exceeded
            if (requests.length >= max) {
                return c.json({
                    error: '請求過於頻繁，請稍後再試',
                    retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000)
                }, 429);
            }

            // Add current request
            requests.push(now);

            // Store in KV with expiration
            await c.env.SESSIONS.put(key, JSON.stringify({ requests }), {
                expirationTtl: Math.ceil(windowMs / 1000),
            });

            // Add rate limit headers
            c.header('X-RateLimit-Limit', max.toString());
            c.header('X-RateLimit-Remaining', (max - requests.length).toString());
            c.header('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

            await next();
        } catch (error) {
            console.error('Rate limit error:', error);
            // Continue on error (fail open)
            await next();
        }
    };
}
