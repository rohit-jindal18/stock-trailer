import { CancelOrderPayload, Exchange, Instrument, OrderUpdatePayload, PlaceOrderPayload, PlaceOrderResponse, Quote, TickerData } from "../models";
import { CONNECTION_INFO } from "../utils/constants";

const KiteConnect = require("kiteconnect").KiteConnect;
const KiteTicker = require("kiteconnect").KiteTicker;

export interface ITickerListener {
    onConnected(): void;
    onDisConnected(): void;
    onError(error: any): void;
    onClose(): void;
    onReConnect(): void;
    onOrderUpdate: (data: any) => void;
    onTickerUpdate: (tickerData: TickerData[]) => void;
}

export class TradingConnectionWrapper {
    private connection: typeof KiteConnect;
    private tickerConnection: typeof KiteTicker;
    private tickerListener: ITickerListener;
    private isSocketConnected: boolean = false;
    private instrumentSubscriptions: number[] = [];
    constructor(tickerListener: ITickerListener) {
        this.tickerListener = tickerListener;
    }

    public async initializeConnection(accessToken: string) {
        this.connection = new KiteConnect({
            api_key: process.env.KITE_API_KEY,
            access_token: accessToken
        });
        this.tickerConnection = new KiteTicker({
            api_key: process.env.KITE_API_KEY,
            access_token: accessToken
        });
        this.initializeSocketConnection();
    }

    private onConnected = () => {
        this.isSocketConnected = true;
        this.tickerListener.onConnected();
        // console.log(this.instrumentSubscriptions);
        this._subscribeInstruments();
    }

    private onDisConnected = () => {
        this.isSocketConnected = false;
        this.tickerListener.onDisConnected();
    }

    private onError = (error: any) => {
        this.isSocketConnected = false;
        this.tickerListener.onError(error);
    }

    private onReConnect = () => {
        this.isSocketConnected = true;
        this.tickerListener.onReConnect();
        this._subscribeInstruments();
    }

    private _subscribeInstruments() {
        if (this.isSocketConnected) {
            this.tickerConnection.subscribe(this.instrumentSubscriptions);
        }
    }

    private initializeSocketConnection() {
        this.tickerConnection.on("connect", this.onConnected);
        this.tickerConnection.on("disconnect", this.onDisConnected);
        this.tickerConnection.on("ticks", this.tickerListener.onTickerUpdate);
        this.tickerConnection.on("error", this.onError);
        this.tickerConnection.on("reconnect", this.onReConnect);
        this.tickerConnection.on("close", this.tickerListener.onClose);
        this.tickerConnection.on("order_update", this.tickerListener.onOrderUpdate);
        this.tickerConnection.connect();
    }

    public getProfile(): Promise<any> {
        return this.connection.getProfile();
    }

    placeOrder(placeOrderPayload: PlaceOrderPayload): Promise<PlaceOrderResponse> {
        return this.connection.placeOrder(placeOrderPayload.variety, placeOrderPayload);
    }

    getInstruments(exchange: Exchange): Promise<Instrument[]> {
        return this.connection.getInstruments(exchange);
    }

    getQuotes(instruments: string[]): Promise<Record<string, Quote>> {
        return this.connection.getQuote(instruments);
    }

    modifyOrder(orderPayload: PlaceOrderPayload): Promise<PlaceOrderResponse> {
        return this.connection.modifyOrder(orderPayload.variety, orderPayload.order_id, orderPayload);
    }

    exitOrder(orderPayload: CancelOrderPayload): Promise<PlaceOrderResponse> {
        return this.connection.cancelOrder(orderPayload.variety, orderPayload.order_id);
    }

    getAllOrders(): Promise<OrderUpdatePayload[]> {
        return this.connection.getOrders();
    }

    public subscribeToInstrument(instrumentId: number): void {
        if (this.instrumentSubscriptions.indexOf(instrumentId) > -1) {
            return;
        }
        this.instrumentSubscriptions.push(instrumentId);
        this._subscribeInstruments();
    }

    public unSubscribeToInstrument(instrumentId: number): void {
        const index = this.instrumentSubscriptions.indexOf(instrumentId);
        if (index > -1) {
            this.instrumentSubscriptions = this.instrumentSubscriptions.splice(index, 1);
            this._subscribeInstruments();
        }
    }

}