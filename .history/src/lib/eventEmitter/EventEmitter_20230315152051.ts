import { EventEmitter } from 'events';
import { EVENT_TYPE } from './constants';

type CallbackType = (args: any) => void;
class AppEventEmitter {
    private _emmiter: any;
    constructor() {
        this._emmiter = new EventEmitter();
    }

    addListener(eventKey: string, callback: CallbackType) {
        const listenerCount = this._emmiter.listenerCount(eventKey);
        console.log("add l;isten called", listenerCount, eventKey, callback, this._emmiter, this._emmiter.on);
        this._emmiter.on(eventKey, (d) => {
            console.log("123123", d);
        })
        const listenerCount2 = this._emmiter.listenerCount(eventKey);
        console.log("listne coint", listenerCount2);
        // if (listenerCount === 0) {

        // }
    }

    emit(eventKey: string, data?: any) {
        console.log("emit", eventKey, data, this._emmiter, this._emmiter.eventNames(), this._emmiter.listenerCount(EVENT_TYPE.QS_UPDATE))
        this._emmiter.emit(eventKey, JSON.stringify(data));
    }

    removeListener(eventKey: string, callback?: CallbackType) {
        this._emmiter.off(eventKey, callback);
    }
}

export default new AppEventEmitter();
