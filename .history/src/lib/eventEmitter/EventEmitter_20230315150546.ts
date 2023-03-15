import EventEmitter from 'events';

type CallbackType = (args: any) => void;
class AppEventEmitter {
    private _emmiter: any;
    constructor() {
        this._emmiter = new EventEmitter();
    }

    addListener(eventKey: string, callback: CallbackType) {
        // const listenerCount = this._emmiter.listenerCount(eventKey);
        this._emmiter.on(eventKey, (d) => {
            console.log("123123", d);
        })
        // if (listenerCount === 0) {

        // }
    }

    emit(eventKey: string, data?: any) {
        this._emmiter.emit(eventKey, data);
    }

    removeListener(eventKey: string, callback?: CallbackType) {
        this._emmiter.off(eventKey, callback);
    }
}

export default new AppEventEmitter();
