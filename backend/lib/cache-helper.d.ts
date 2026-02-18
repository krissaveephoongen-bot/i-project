/**
 * Cache Helper Type Definitions
 */

export function getOrFetch<T>(
  namespace: string,
  id: string | number,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T>;

export function invalidateCache(namespace: string, id: string | number): Promise<void>;
export function invalidateNamespace(namespace: string): Promise<void>;
