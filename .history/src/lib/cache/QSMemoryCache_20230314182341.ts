import { MemoryCache } from 'memory-cache-node';
import BaseMemoryCache from './BaseMemoryCache';

const QS_INSTRUMENTS_KEY = 'qs_instruments';

class QSMemoryCache extends BaseMemoryCache {
    storeQSInstruments(value: any) {
        this.storeItemsInCache(QS_INSTRUMENTS_KEY, value);
    }

    getQSInstruments() {
        return this.getItemsFromCache(QS_INSTRUMENTS_KEY);
    }
}

export default new QSMemoryCache();