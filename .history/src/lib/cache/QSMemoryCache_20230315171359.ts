import { MemoryCache } from 'memory-cache-node';
import EventEmitter from '../eventEmitter/EventEmitter';
import BaseMemoryCache from './BaseMemoryCache';
import { EVENT_TYPE } from '../eventEmitter/constants';

const QS_INSTRUMENTS_KEY = 'qs_instruments';

class QSMemoryCache extends BaseMemoryCache {

    private tag = 'TEST_1';
    private instruments;
    storeQSInstruments = (value: any) => {
        console.log('Ref storeQSInstruments :: ', this);
        // EventEmitter.emitQSListener(value)
        console.log("emitted", value);
        this.instruments = value;
        this.storeItemsInCache(QS_INSTRUMENTS_KEY, value);
    }

    setTag = (tag: string) => {
        this.tag = tag;
    }

    printTag = (tag: string) => {
        console.log('CACHE_TAG :: ', this.tag);
    }

    getQSInstruments = () => {
        console.log("this.instruments = value;", this.instruments)
        return this.getItemsFromCache(QS_INSTRUMENTS_KEY);
    }
}

export default new QSMemoryCache();