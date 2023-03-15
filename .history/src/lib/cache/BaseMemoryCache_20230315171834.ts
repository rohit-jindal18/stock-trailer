import { MemoryCache } from 'memory-cache-node';

const ITEM_EXPIRATION_TIME = 1 * 24 * 60 * 60;
const MAX_ITEM_COUNT = 5;

export default class BaseMemoryCache {
    private memoryCache: MemoryCache<string, any>;
    constructor() {
        this.memoryCache = new MemoryCache<string, any>(ITEM_EXPIRATION_TIME, MAX_ITEM_COUNT);
    }

    protected storeItemsInCache(key: string, value: any) {
        this.memoryCache.storeExpiringItem(key, value, ITEM_EXPIRATION_TIME);
    }

    protected getItemsFromCache(key: string) {
        console.log(this.memoryCache.getItems(), "rohitjindal");
        return this.memoryCache.retrieveItemValue(key);
    }
}