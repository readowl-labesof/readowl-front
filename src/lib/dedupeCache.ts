// Small dedupe cache using Redis when available, fallback to in-memory TTL map
const mem = new Map<string, number>();

async function getRedisClient(): Promise<{ set: (key: string, value: string, ttlMs: number) => Promise<boolean> } | null> {
  // Prefer ioredis if REDIS_URL provided
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
  const { default: IORedis } = await import('ioredis');
      const u = new URL(redisUrl);
      const client = new IORedis({
        host: u.hostname,
        port: Number(u.port || (u.protocol === 'rediss:' ? 6380 : 6379)),
        password: u.password || undefined,
        tls: u.protocol === 'rediss:' ? {} : undefined,
      });
      type IORedisClient = { set: (key: string, value: string, mode1: 'PX', ttlMs: number, mode2: 'NX') => Promise<'OK' | null> };
      const c = client as unknown as IORedisClient;
      return {
        async set(key: string, value: string, ttlMs: number) {
          const res = await c.set(key, value, 'PX', ttlMs, 'NX');
          return res === 'OK';
        },
      };
    } catch {
      // fallthrough
    }
  }
  // Upstash REST fallback
  const base = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, '');
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (base && token) {
    return {
      async set(key: string, value: string, ttlMs: number) {
        const url = `${base}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}?px=${ttlMs}&nx=true`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const j = await res.json().catch(() => ({}));
        // Upstash returns { result: 'OK' } when set applied, or null when NX condition fails
        return j && j.result === 'OK';
      },
    };
  }
  return null;
}

export async function acquireOnce(key: string, ttlMs: number): Promise<boolean> {
  const redis = await getRedisClient();
  if (redis) {
    try {
      return await redis.set(key, '1', ttlMs);
    } catch {
      // ignore and fallback
    }
  }
  // Fallback to memory
  const now = Date.now();
  const exp = mem.get(key);
  if (exp && exp > now) return false;
  mem.set(key, now + ttlMs);
  return true;
}
