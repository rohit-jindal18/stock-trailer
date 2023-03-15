import fs from "fs";
import { ACCESS_TOKEN_FILE_PATH } from "../utils/constants";
import { getCurrentDate, isDateEqual } from "../utils/helper";
import { ITickerListener, TradingConnectionWrapper } from "../modules/TradingModule";
import { CancelOrderPayload, Exchange, Instrument, InstrumentInfo, OrderUpdatePayload, PlaceOrderPayload, PlaceOrderResponse, Quote, TickerData } from "../models";
import { StrategyManager } from "../manager/StrategyManager";
import InstrumentDataProvider from "../providers/InstrumentDataProvider";
import { OrderManager } from "../manager/OrderManager";
import BaseAnalyzer from "../analytics/BaseAnalyzer";
import QuickShortAnalyzer from "../analytics/QuickShortAnalyzer";
import QuickLongAnalyzer from "../analytics/QuickLongAnalyzer";
import BTSTAnalyzer from "../analytics/BTSTAnalyzer";
import { StockTrailerUser } from "@stock-trailer/types";

export interface ITradeDelegate {
    placeOrder(placeOrderPayload: PlaceOrderPayload): Promise<PlaceOrderResponse>;
    exitOrder(orderPayload: CancelOrderPayload): Promise<PlaceOrderResponse>;
    updateOrder(orderPayload: PlaceOrderPayload): Promise<PlaceOrderResponse>;
    getInstruments(exchange: Exchange): Promise<Instrument[]>;
    getQuotes(instruments: string[]): Promise<Record<string, Quote>>;
    getAllOrders(): Promise<OrderUpdatePayload[]>;
    getOrderManager(): OrderManager | undefined;
    subscribeToInstrument(instrumentId: number): void;
    unSubscribeToInstrument(instrumentId: number): void;
    getInstrumentData(): Record<string, InstrumentInfo>;
    initializeQSStrategy(): void;
    getProcessedInstruments(exchange: Exchange): Record<string, Instrument>
}

export enum TPMode {
    TRADE = 'TRADE',
    QS_ANALYZER = 'QS_ANALYZER',
    QL_ANALYZER = 'QL_ANALYZER',
    BTST_ANALYZER = 'BTST_ANALYZER'
}

export class TradingController implements ITradeDelegate, ITickerListener {

    private accessToken: string = '';
    private tradingModule?: TradingConnectionWrapper;
    private strategyManager?: StrategyManager;
    private orderManager?: OrderManager;
    private instrumentData: Record<string, InstrumentInfo> = {};
    private analyzer?: BaseAnalyzer;
    private userInfo?: StockTrailerUser;

    constructor(userInfo: StockTrailerUser, mode?: TPMode) {
        this.userInfo = userInfo;
        this.initialize(mode);
    }

    private getAnalyzerForMode(mode: TPMode = TPMode.QS_ANALYZER): BaseAnalyzer | undefined {
        switch (mode) {
            case TPMode.QS_ANALYZER:
                return new QuickShortAnalyzer(this);
            case TPMode.QL_ANALYZER:
                return new QuickLongAnalyzer(this);
            case TPMode.BTST_ANALYZER:
                return new BTSTAnalyzer(this);
            default:
                return undefined;
        }
    }

    private async initialize(mode?: TPMode) {
        try {
            if (this.userInfo?.session?.access_token) {
                this
                    .accessToken = this.userInfo?.session?.access_token;
            } else {
                console.log('Could not store access token for user');
                return Promise.reject();
            }
            const instrumentData = await InstrumentDataProvider.getData();
            if (instrumentData) {
                this.instrumentData = instrumentData;
            } else {
                console.log('Instrument Data is Empty');
                return Promise.reject();
            }
            console.log("initia", this.accessToken);
        } catch (e) {
            console.error(e);
            return Promise.reject();
        }

        // Now the accessToken has been initialized
        this.tradingModule = new TradingConnectionWrapper(this);
        await this.tradingModule.initializeConnection(this.accessToken);
        if (!mode || mode === TPMode.TRADE) {
            this.orderManager = new OrderManager(this);
            this.strategyManager = new StrategyManager(this);
        } else {
            this.analyzer = this.getAnalyzerForMode(mode);
        }
        return Promise.resolve();
    }

    initializeQSStrategy(): void {

    }

    placeOrder(placeOrderPayload: PlaceOrderPayload): Promise<PlaceOrderResponse> {
        return this.tradingModule?.placeOrder(placeOrderPayload) || Promise.reject("Trading module not initialized");
    }

    getInstruments(exchange: Exchange): Promise<Instrument[]> {
        return this.tradingModule?.getInstruments(exchange) || Promise.reject("Trading module not initialized");
    }

    getQuotes(instruments: string[]): Promise<Record<string, Quote>> {
        return this.tradingModule?.getQuotes(instruments) || Promise.reject("Trading module not initialized");
    }

    exitOrder(orderPayload: CancelOrderPayload): Promise<PlaceOrderResponse> {
        return this.tradingModule?.exitOrder(orderPayload) || Promise.reject("Trading module not initialized");
    }

    updateOrder(orderPayload: PlaceOrderPayload): Promise<PlaceOrderResponse> {
        return this.tradingModule?.modifyOrder(orderPayload) || Promise.reject("Trading module not initialized");
    }

    getAllOrders(): Promise<OrderUpdatePayload[]> {
        return this.tradingModule?.getAllOrders() || Promise.reject("Trading module not initialized");
    }

    getOrderManager(): OrderManager | undefined {
        return this.orderManager;
    }

    subscribeToInstrument(instrumentId: number): void {
        //18098434
        this.tradingModule?.subscribeToInstrument(instrumentId);
    }

    unSubscribeToInstrument(instrumentId: number): void {
        this.tradingModule?.unSubscribeToInstrument(instrumentId);
    }

    getInstrumentData(): Record<string, InstrumentInfo> {
        return this.instrumentData;
    }

    onConnected(): void {
        console.log("onConnected");
    }

    onDisConnected(): void {
        console.log("onDisConnected");
    }

    onError(error: any): void {
        console.log("onError", error);
    }

    onClose(): void {
        console.log("onClose");
    }

    onReConnect(): void {
        console.log("onReConnect");
    }

    onOrderUpdate = (orderUpdatePayload: OrderUpdatePayload): void => {
        this.orderManager?.updateOrder(orderUpdatePayload);
        console.log("onOrderUpdate", orderUpdatePayload);
    }

    onTickerUpdate = (tickerData: TickerData[]): void => {
        console.log("onTickerUpdate");
        this.strategyManager?.onTickerUpdate(tickerData);
    }
}