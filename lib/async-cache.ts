/** Bounded process/session cache. Concurrent readers share work; failures are retried. */
export function createAsyncCache<T>(ttlMs: number, maxEntries = 24, cacheable: (value: T) => boolean = () => true) {
  const values = new Map<string, { value: T; expires: number }>();
  const pending = new Map<string, Promise<T>>();
  const peek = (key: string): T | undefined => {
    const entry = values.get(key);
    if (!entry) return undefined;
    if (entry.expires <= Date.now()) { values.delete(key); return undefined; }
    return entry.value;
  };
  const get = (key: string, load: () => Promise<T>, force = false): Promise<T> => {
    if (force) { values.delete(key); pending.delete(key); }
    const cached = peek(key);
    if (cached !== undefined) return Promise.resolve(cached);
    const existing = pending.get(key);
    if (existing) return existing;
    const request = Promise.resolve().then(load).then(value => {
      // A superseded request must never overwrite a newer refresh.
      if (pending.get(key) === request && ttlMs > 0 && cacheable(value)) {
        for (const [k, entry] of values) if (entry.expires <= Date.now()) values.delete(k);
        values.delete(key);
        values.set(key, { value, expires: Date.now() + ttlMs });
        while (values.size > maxEntries) values.delete(values.keys().next().value!);
      }
      return value;
    }).finally(() => { if (pending.get(key) === request) pending.delete(key); });
    pending.set(key, request);
    return request;
  };
  return { get, peek };
}
