import { createAsyncCache } from "./async-cache";

// Short session cache: 3PP and VAS share a response, with no persistent storage.
const cache = createAsyncCache<unknown>(30_000);
export function peekDashboardJSON<T>(url: string): T | undefined { return cache.peek(url) as T | undefined; }
export function getDashboardJSON<T>(url: string, force = false): Promise<T> {
  return cache.get(url, async () => {
    const response = await fetch(force ? `${url}${url.includes("?") ? "&" : "?"}refresh=1` : url, {
      cache: force ? "no-store" : "default",
      signal: AbortSignal.timeout(30_000),
    });
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || `Gagal memuat data (${response.status})`);
    return data;
  }, force) as Promise<T>;
}
