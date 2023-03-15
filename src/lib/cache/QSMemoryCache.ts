import { MemoryCache } from 'memory-cache-node';
import EventEmitter from '../eventEmitter/EventEmitter';
import BaseMemoryCache from './BaseMemoryCache';
import { EVENT_TYPE } from '../eventEmitter/constants';

const QS_INSTRUMENTS_KEY = 'qs_instruments';

class QSMemoryCache extends BaseMemoryCache {

    private tag = 'TEST_1';
    storeQSInstruments = (value: any) => {
        this.storeItemsInCache(QS_INSTRUMENTS_KEY, value);
    }

    setTag = (tag: string) => {
        this.tag = tag;
    }

    printTag = (tag: string) => {
        console.log('CACHE_TAG :: ', this.tag);
    }

    getQSInstruments = () => {
        return this.getItemsFromCache(QS_INSTRUMENTS_KEY);
    }
}

export default new QSMemoryCache();