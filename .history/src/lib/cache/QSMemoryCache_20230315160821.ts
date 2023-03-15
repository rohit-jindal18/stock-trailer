import { MemoryCache } from 'memory-cache-node';
import EventEmitter from '../eventEmitter/EventEmitter';
import BaseMemoryCache from './BaseMemoryCache';
import { EVENT_TYPE } from '../eventEmitter/constants';

const QS_INSTRUMENTS_KEY = 'qs_instruments';

class QSMemoryCache extends BaseMemoryCache {
    storeQSInstruments = (value: any) => {
        console.log('Ref storeQSInstruments :: ', this);
        // EventEmitter.emitQSListener(value)
        console.log("emitted", value);
        this.storeItemsInCache(QS_INSTRUMENTS_KEY, value);
    }

    getQSInstruments = () => {
        return this.getItemsFromCache(QS_INSTRUMENTS_KEY);
    }
}

export default new QSMemoryCache();