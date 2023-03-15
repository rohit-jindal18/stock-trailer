var EventEmitter = require('eventemitter3');
import { EVENT_TYPE } from './constants';


type CallbackType = (args: any) => void;

// const eventEmitter = new EventEmitter();

class AppEventEmitter {
    private qsListeners?: any[];

    addQSListener = (callback: CallbackType) => {
        // const listenerCount = eventEmitter.listenerCount(eventKey);

        (this.qsListeners || []).push(callback);
        console.log("add l;isten called", this, this.qsListeners);
        // eventEmitter.on(eventKey, (d) => {
        //     console.log("123123", d);
        // })
        // const listenerCount2 = eventEmitter.listenerCount(eventKey);
        // console.log("listne coint", listenerCount2);
        // if (listenerCount === 0) {

        // }
    }

    emitQSListener = (data?: any) => {
        console.log("listne outside", data, this.qsListeners, this);
        (this.qsListeners || []).forEach(listener => {
            console.log("listne", listener)
            listener(data);
        })
        // const listenerCount2 = eventEmitter.listenerCount(eventKey);
        // console.log("listne coint while emitting", listenerCount2);
        // console.log("emit", eventKey, data, eventEmitter, eventEmitter.eventNames(), eventEmitter.listenerCount(EVENT_TYPE.QS_UPDATE))
        // eventEmitter.emit(eventKey, JSON.stringify(data));
    }

    removeListener = (eventKey: string, callback?: CallbackType) => {
        // eventEmitter.off(eventKey, callback);
    }
}

export default new AppEventEmitter();
