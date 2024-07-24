import tarCache from '../index';

describe('TarCache', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        tarCache['cache'].clear();
    });

    it("list key", () => {
        const key = 'testKey';
        const func = (payload: string) => {
            return payload + 'testValue';
        }
        tarCache.set(key, func, "payload", -1);
        tarCache.set(key + 1, func, "payload", -1);
        tarCache.set(key + 2, func, "payload", -1);
        const keys = tarCache.getListKey()
        const size = tarCache.getSize()
        expect(size).toBe(3)
        console.log(keys)
    });
    it('call function cache value', () => {
        const key = 'testKey';
        const func = (payload: string) => {
            console.info("payload not in memory")
            return payload + 'testValue';
        }
        const ttl = 5000;

        tarCache.set(key, func, "payload", ttl);

        const cachedValue = tarCache.get<string>(key);
        const cachedValue2 = tarCache.get<string>(key);
        expect(cachedValue).toBe('payloadtestValue');
        expect(cachedValue2).toBe('payloadtestValue');
    });


    it('should cache and retrieve a value', () => {
        const key = 'testKey';
        const func = () => 'testValue';
        const ttl = 5000;

        tarCache.set(key, func, null, ttl);

        const cachedValue = tarCache.get<string>(key);
        expect(cachedValue).toBe('testValue');
    });

    it('should return null after TTL expires', () => {
        const key = 'testKey';
        const func = () => 'testValue';
        const ttl = 5000;

        tarCache.set(key, func, null, ttl);

        jest.advanceTimersByTime(ttl + 1);

        const cachedValue = tarCache.get<string>(key);
        expect(cachedValue).toBeNull();
    });

    it('should overwrite existing cache with the same key', () => {
        const key = 'testKey';
        const func1 = () => 'testValue1';
        const func2 = () => 'testValue2';
        const ttl = 5000;

        tarCache.set(key, func1, null, ttl);
        tarCache.set(key, func2, null, ttl);

        const cachedValue = tarCache.get<string>(key);
        expect(cachedValue).toBe('testValue2');
    });

    it('should delete expired cache', () => {
        const key = 'testKey';
        const func = () => 'testValue';
        const ttl = 5000;

        tarCache.set(key, func, null, ttl);

        jest.advanceTimersByTime(ttl + 1);

        const cachedValue = tarCache.get<string>(key);
        expect(cachedValue).toBeNull();
    });
});
