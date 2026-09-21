export const CACHE_NAMESPACES = { runtime: "runtime", git: "git" };
export class AsyncCache {
    entries = new Map();
    maxEntries;
    now;
    constructor(maxEntries = 200, now = () => Date.now()) {
        this.maxEntries = maxEntries;
        this.now = now;
    }
    get(ns, key, ttlMs, filter, fetcher, onRefresh) {
        const cacheKey = this.cacheKey(ns, key);
        const entry = this.entryFor(cacheKey);
        if (this.isFresh(entry, ttlMs))
            return entry.value;
        this.addListener(entry, onRefresh);
        if (!entry.pending)
            entry.pending = this.refresh(entry, filter, fetcher);
        return entry.value;
    }
    clear() {
        this.entries.clear();
    }
    entryFor(cacheKey) {
        const cached = this.entries.get(cacheKey);
        if (cached)
            return cached;
        const entry = {
            value: null,
            updatedAt: null,
            pending: null,
            listeners: new Set(),
        };
        this.entries.set(cacheKey, entry);
        this.evictOldestEntry();
        return entry;
    }
    isFresh(entry, ttlMs) {
        return entry.updatedAt !== null && this.now() - entry.updatedAt < ttlMs;
    }
    addListener(entry, listener) {
        if (listener)
            entry.listeners.add(listener);
    }
    async refresh(entry, filter, fetcher) {
        try {
            entry.value = await fetcher(filter);
        }
        catch {
            entry.value = null;
        }
        finally {
            entry.updatedAt = this.now();
            entry.pending = null;
            this.notify(entry);
        }
    }
    notify(entry) {
        const listeners = [...entry.listeners];
        entry.listeners.clear();
        for (const listener of listeners) {
            try {
                listener();
            }
            catch {
                // Cache refresh notifications are best-effort.
            }
        }
    }
    evictOldestEntry() {
        if (this.entries.size <= this.maxEntries)
            return;
        const oldestKey = this.entries.keys().next().value;
        if (oldestKey !== undefined)
            this.entries.delete(oldestKey);
    }
    cacheKey(ns, key) {
        return `${ns}:${String(key)}`;
    }
}
export const asyncCache = new AsyncCache();
