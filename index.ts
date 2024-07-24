interface CacheEntry<T> {
    value: T;
    expiry: number;
    intervalId?: NodeJS.Timeout;
}

class TarCache {
    private cache: Map<string, CacheEntry<any>> = new Map();

    getListKey(): string[] {
        return Array.from(this.cache.keys());
    }

    getSize(): number {
        return this.cache.size
    }

    set<T>(key: string, func: (payload: any) => T, payload: any, timeToLive: number): void {
        this.setValueWithPayload(key, func, payload, timeToLive, -1)
    }

    setValueWithPayload<T>(key: string, func: (payload: any) => T, payload: any, timeToLive: number, intervalFetchData: number): void {
        const value = func(payload);
        const expiry = timeToLive > 0 ? Date.now() + timeToLive : timeToLive;
        const cacheEntry: CacheEntry<T> = {value, expiry};
        this.cache.set(key, cacheEntry);
        if (intervalFetchData > 0) {
            const intervalId = setInterval(() => {
                const newValue = func(payload);
                this.cache.set(key, {
                    value: newValue,
                    expiry: Date.now() + timeToLive,
                    intervalId
                });
            }, intervalFetchData);
            cacheEntry.intervalId = intervalId;
        }
        if (timeToLive > 0) {
            setTimeout(() => {
                const entry = this.cache.get(key);
                if (entry && entry.intervalId) {
                    clearInterval(entry.intervalId);
                }
                this.cache.delete(key);
            }, timeToLive);
        }

    }

    setExpire(key: string, timeToLive: number): void {
        setTimeout(() => {
            const entry = this.cache.get(key);
            if (entry && entry.intervalId) {
                clearInterval(entry.intervalId);
            }
            this.cache.delete(key);
        }, timeToLive);
    }


    delete(key: string) {
        const cachedItem = this.cache.get(key);
        if (cachedItem) {
            if (cachedItem.intervalId) {
                clearInterval(cachedItem.intervalId);
            }
            this.cache.delete(key);
        }
    }

    get<T>(key: string): T | null {
        const cachedItem = this.cache.get(key);
        if (!cachedItem) {
            return null;
        }
        if (cachedItem.expiry > 0 && Date.now() > cachedItem.expiry) {
            if (cachedItem.intervalId) {
                clearInterval(cachedItem.intervalId);
            }
            this.cache.delete(key);
            return null;
        }
        return cachedItem.value;
    }
}

export default new TarCache();
