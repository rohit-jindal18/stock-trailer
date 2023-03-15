import { MemoryCache } from 'memory-cache-node';
import BaseMemoryCache from './BaseMemoryCache';

const QS_INSTRUMENTS_KEY = 'qs_instruments';

export default class QSMemoryCache extends BaseMemoryCache {
    storeQSInstruments(value: any) {
        this.storeItemsInCache(QS_INSTRUMENTS_KEY, value);
    }

    getQSInstruments(key: string) {
        return this.getItemsFromCache(key);
    }
}