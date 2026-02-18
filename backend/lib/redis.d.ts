/**
 * Redis Client Type Definitions
 */

export interface RedisClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  ping(): Promise<string>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<string>;
  setEx(key: string, seconds: number, value: string): Promise<string>;
  del(key: string | string[]): Promise<number>;
  flushDb(): Promise<string>;
  keys(pattern: string): Promise<string[]>;
  ttl(key: string): Promise<number>;
}

export function initRedis(): Promise<RedisClient | null>;
export function getRedis(): RedisClient | null;
export function closeRedis(): Promise<void>;

export function cacheSet(
  key: string,
  value: any,
  ttlSeconds?: number
): Promise<any | null>;

export function cacheGet(key: string): Promise<any | null>;
export function cacheDel(key: string): Promise<number | null>;
export function cacheFlush(): Promise<string | null>;
