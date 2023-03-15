import { MemoryCache } from 'memory-cache-node';
import EventEmitter from '../eventEmitter/EventEmitter';
import BaseMemoryCache from './BaseMemoryCache';
import { EVENT_TYPE } from '../eventEmitter/constants';

const QS_INSTRUMENTS_KEY = 'qs_instruments';

class QSMemoryCache extends BaseMemoryCache {
    storeQSInstruments(value: any) {
        this.storeItemsInCache(QS_INSTRUMENTS_KEY, value);
        EventEmitter.emit(EVENT_TYPE.QS_UPDATE)
    }

    getQSInstruments() {
        return this.getItemsFromCache(QS_INSTRUMENTS_KEY);
    }
}

export default new QSMemoryCache();