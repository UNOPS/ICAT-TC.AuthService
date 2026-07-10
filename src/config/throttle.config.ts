export const defaultThrottle = { name: 'default', ttl: 60_000, limit: 120 };

export const strictThrottle = { default: { limit: 5, ttl: 60_000 } };
export const authThrottle = { default: { limit: 10, ttl: 60_000 } };
