import { EventEmitter } from 'events';
import { EVENT_TYPE } from './constants';


type CallbackType = (args: any) => void;

const eventEmitter = new EventEmitter();

class AppEventEmitter {
    constructor() {
        eventEmitter.emit('rohit')
    }

    addListener(eventKey: string, callback: CallbackType) {
        const listenerCount = eventEmitter.listenerCount(eventKey);
        console.log("add l;isten called", listenerCount, eventKey, callback, eventEmitter, eventEmitter.on);
        eventEmitter.on(eventKey, (d) => {
            console.log("123123", d);
        })
        const listenerCount2 = eventEmitter.listenerCount(eventKey);
        console.log("listne coint", listenerCount2);
        // if (listenerCount === 0) {

        // }
    }

    emit(eventKey: string, data?: any) {
        const listenerCount2 = eventEmitter.listenerCount(eventKey);
        console.log("listne coint while emitting", listenerCount2);
        console.log("emit", eventKey, data, eventEmitter, eventEmitter.eventNames(), eventEmitter.listenerCount(EVENT_TYPE.QS_UPDATE))
        eventEmitter.emit(eventKey, JSON.stringify(data));
    }

    removeListener(eventKey: string, callback?: CallbackType) {
        eventEmitter.off(eventKey, callback);
    }
}

export default new AppEventEmitter();
