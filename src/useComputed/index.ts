import { computed, type ComputedRef } from 'vue';

/**
 * @description useComputed
 * @param fn 需要缓存的函数
 * @returns {(...args: Parameters<F>) => ReturnType<F>} 返回一个函数，调用该函数会返回缓存的结果
 */
export function useComputed<F extends (...args: any[]) => ReturnType<F>>(fn: F): (...args: Parameters<F>) => ReturnType<F> {
    const cache = new Map<Parameters<F>, ComputedRef<ReturnType<F>>>();

    function compareKey(args1: Parameters<F>, args2: Parameters<F>) {
        return args1.length === args2.length && args1.every((item, index) => Object.is(item, args2[index]));
    }

    function getCache(args: Parameters<F>): ComputedRef<ReturnType<F>> | undefined {
        const keys = [...cache.keys()];
        const key = keys.find(item => compareKey(item, args));
        if (key) {
            return cache.get(key);
        }
        return undefined;
    }

    return function (...args: Parameters<F>): ReturnType<F> {
        const cacheResult = getCache(args);
        if (cacheResult) {
            return cacheResult.value;
        }
        const result = computed<ReturnType<F>>(() => fn(...args));
        cache.set(args, result);
        return result.value;
    };
}

