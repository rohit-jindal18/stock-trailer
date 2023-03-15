import { Exchange, InstrumentInfo, OptionType, OrderStatus, OrderType, OrderUpdatePayload, OrderValidity, OrderVariety, PlaceOrderPayload, PlaceOrderResponse, ProductCode, TickerData, TransactionType } from "../models";
import BaseStrategy from "./BaseStrategy";
import { scheduleJob } from 'node-schedule';
import chalk from 'chalk';
import fs from 'fs';
import console from "console";
import QSMemoryCache from "../cache/QSMemoryCache";
import EventEmitter from "../eventEmitter/EventEmitter";
import { EVENT_TYPE } from "../eventEmitter/constants";

interface ShortInstrumentPayload {
    instrumentId: number;
    tradingSymbol: string;
    quantity: number;
}

// const SHORTS: ShortInstrumentPayload[] = [
//     {
//         instrumentId: 20225,
//         tradingSymbol: 'ALEMBICLTD',
//         quantity: 5000
//     }
// ];

let SHORTS_MAP: Record<number, ShortInstrumentPayload> = {};
// function buildMap() {
//     for (let short of SHORTS) {
//         SHORTS_MAP[short.instrumentId] = short;
//     }
// }

interface ShortInstrumentMeta {
    openPrice: number;
    percentChange: number;
    previousClose: number;
    positionPrice?: number;
    positionPercent?: number;
}

export class QuickShortStrategy extends BaseStrategy {
    private static readonly STRATEGY_ID = 2;
    private static readonly trailingSoplossBracket = 0.5; // This is in percent
    private static readonly initialSoplossPrecent = 3; // This is in percent
    private static readonly initialSoplossPositionalPrecent = 4; // This is in percent
    private static instrumentToShortOrderMapping: Record<number, OrderUpdatePayload> = {};
    private static instrumentToSLMOrderMapping: Record<number, OrderUpdatePayload> = {};
    private static instrumentToMetaMapping: Record<number, ShortInstrumentMeta> = {};
    private static readonly shortInstruments = new Set<number>();
    private static readonly slmOrders = new Set<number>();
    private static readonly initialOrders = new Set<string>();
    private instruments: ShortInstrumentPayload[] = [];

    public getStrategyId(): number {
        return QuickShortStrategy.STRATEGY_ID;
    }

    protected initialize(): void {
        // buildMap();
        console.log("iniutialz");
        this.delegate.getOrderManager()?.addListener(this);
        // EventEmitter.addQSListener(this.listenToInstruments);
        // Job for instrument setup
        console.log("setup");
        scheduleJob('00 49 17 * * *', (fireDate: Date) => {
            console.log("scheduleJob 00 35 16 * * *")
            this.setupInstruments();
        });

        scheduleJob('00 15 09 * * *', (fireDate: Date) => {
            this.triggerShortTrade();
        });
    }

    buildShortMap = (instruments: ShortInstrumentPayload[]) => {
        SHORTS_MAP = instruments.reduce((m, a) => ({
            ...m,
            [a.instrumentId]: a
        }), {});
    }

    setupInstruments() {
        QSMemoryCache.setTag('TEST_2');
        const instruments = fs.readFileSync('qsInstruments.txt', { encoding: 'utf-8' });
        console.log("insuteaa", instruments);
        this.instruments = instruments;
        console.log("setup isntrument", instruments);
        // this.instruments = QSMemoryCache.getQSInstruments();
        console.log("cache", this.instruments, typeof this.instruments);
        this.buildShortMap(instruments);
        console.log("SHORTMAP", SHORTS_MAP, this.instruments);
        instruments.map((instrument: ShortInstrumentPayload) => {
            this.delegate.subscribeToInstrument(instrument.instrumentId, this);
            QuickShortStrategy.shortInstruments.add(instrument.instrumentId);
        })
    }

    onOrdersUpdated(orders: OrderUpdatePayload[]): void {
        orders.map((slmOrder: OrderUpdatePayload) => {
            if (QuickShortStrategy.shortInstruments.has(slmOrder.instrument_token)) {
                if (QuickShortStrategy.initialOrders.has(slmOrder.order_id)
                    && slmOrder.order_type === OrderType.MARKET
                    && slmOrder.transaction_type === TransactionType.SELL
                    && slmOrder.status === OrderStatus.COMPLETE
                    && !QuickShortStrategy.instrumentToShortOrderMapping[slmOrder.instrument_token]) {
                    // this is the slmOrder placed initially
                    QuickShortStrategy.instrumentToShortOrderMapping[slmOrder.instrument_token] = slmOrder;
                    if (QuickShortStrategy.instrumentToMetaMapping[slmOrder.instrument_token]) {
                        const instrumentMeta: ShortInstrumentMeta = QuickShortStrategy.instrumentToMetaMapping[slmOrder.instrument_token];
                        const { previousClose } = instrumentMeta;
                        const newInstrumentMeta = { ...instrumentMeta };
                        newInstrumentMeta.positionPrice = slmOrder.average_price;
                        newInstrumentMeta.positionPercent = ((slmOrder.average_price - previousClose) / previousClose) * 100;
                        QuickShortStrategy.instrumentToMetaMapping[slmOrder.instrument_token] = newInstrumentMeta;
                    }
                } else if (slmOrder.order_type === OrderType.SLM
                    && slmOrder.transaction_type === TransactionType.BUY
                    && slmOrder.status === OrderStatus.TRIGGER_PENDING) {
                    // These are the trailing stop loss orders that are placed
                    QuickShortStrategy.instrumentToSLMOrderMapping[slmOrder.instrument_token] = slmOrder;
                    if (QuickShortStrategy.slmOrders.has(slmOrder.instrument_token)) {
                        QuickShortStrategy.slmOrders.delete(slmOrder.instrument_token);
                    }
                }
            }
        });
        // TODO process all the slmOrder data
        /**
         * 1. Check the average_price when the initial slmOrder was placed, This gived the data for placed position.
         * 
         */
    }

    private _getOrderPayload(instrument: ShortInstrumentPayload
        , transaction_type?: TransactionType
        , quantity?: number
        , order_type?: OrderType
        , trigger_price?: number
        , order_id?: string): PlaceOrderPayload {
        return {
            exchange: Exchange.NSE,
            variety: OrderVariety.regular,
            tradingsymbol: instrument.tradingSymbol,
            transaction_type: transaction_type || TransactionType.SELL,
            order_type: order_type || OrderType.MARKET,
            quantity: quantity || instrument.quantity,
            product: ProductCode.MIS,
            price: 0,
            validity: OrderValidity.DAY,
            disclosed_quantity: 0,
            trigger_price: trigger_price || 0,
            squareoff: 0,
            stoploss: 0,
            trailing_stoploss: 0,
            order_id
        };
    }


    private async _placeInitialStopLossOrder(shortInstrumentData: ShortInstrumentPayload, instrumentMeta: ShortInstrumentMeta): Promise<void> {
        // This is the initial stop loss
        const triggerPrice = this._getInitialStoploss(shortInstrumentData, instrumentMeta);
        const orderPayload = this._getOrderPayload(shortInstrumentData
            , TransactionType.BUY
            , shortInstrumentData.quantity
            , OrderType.SLM
            , triggerPrice);
        try {
            const placeOrderResponse: PlaceOrderResponse = await this.delegate.placeOrder(orderPayload);
            console.log('SLM Trade ' + shortInstrumentData.tradingSymbol + ' :: ', chalk.white.bgGreen.bold(placeOrderResponse.order_id));
            // console.log('SLM Trade ' + shortInstrumentData.tradingSymbol + ' :: SUCCESS :: ', placeOrderResponse.order_id);
            QuickShortStrategy.slmOrders.add(shortInstrumentData.instrumentId);
            this.delegate.getOrderManager()?.syncOrders();
        } catch (e) {
            console.log('SLM Trade ' + shortInstrumentData.tradingSymbol + ' :: ', chalk.white.bgRed.bold('ERROR'));
            // console.log('SLM Trade ' + shortInstrumentData.tradingSymbol + ' :: ', 'ERROR');
            console.log(JSON.stringify(e));
        }
        return Promise.resolve();
    }

    private async _modifyStopLossForOrder(instrument: ShortInstrumentPayload
        , trigger_price: number
        , order_id: string) {
        // This is for the SL-M orders placed
    }

    private async triggerShortTrade() {
        for (let instrument of this.instruments) {
            try {
                const payload: PlaceOrderPayload = this._getOrderPayload(instrument);
                // const placeOrderResponse: PlaceOrderResponse = await this.delegate.placeOrder(payload);


                this.delegate.placeOrder(payload).then((placeOrderResponse: PlaceOrderResponse) => {
                    console.log('First Trade ' + instrument.tradingSymbol + ' :: ', chalk.white.bgGreen.bold(placeOrderResponse.order_id));
                    // console.log('First Trade ' + instrument.tradingSymbol + ' :: SUCCESS :: ', placeOrderResponse.order_id);
                    QuickShortStrategy.initialOrders.add(placeOrderResponse.order_id);
                    this.delegate.getOrderManager()?.syncOrders();
                }).catch((e) => {
                    console.log('First Trade ' + instrument.tradingSymbol + ' :: ', chalk.white.bgRed.bold('ERROR'));
                    // console.log('First Trade ' + instrument.tradingSymbol + ' :: ', 'ERROR');
                    console.log(JSON.stringify(e));
                })
            } catch (e) {

            }
        }
        this.delegate.getOrderManager()?.syncOrders();
    }

    private _getRoundedPrice(price: number) {
        let newPrice = Math.round((price + Number.EPSILON) * 100) / 100;
        let inv = 1.0 / 0.05;
        return Math.round(newPrice * inv) / inv;
    }


    /**
     * openPrice : 102
     * previousClose : 100
     * 
     * 
     * @param shortInstrumentData 
     * @param instrumentMeta 
     * @returns 
     */
    private _getInitialStoploss(shortInstrumentData: ShortInstrumentPayload, instrumentMeta: ShortInstrumentMeta): number {
        const { openPrice, previousClose, positionPercent } = instrumentMeta;
        const openPercentChange = ((openPrice - previousClose) / previousClose) * 100;
        let initialStopLossPercent = QuickShortStrategy.initialSoplossPrecent;
        let basePrice = openPrice;
        let basePercentChange = openPercentChange;
        if (positionPercent) {
            initialStopLossPercent = QuickShortStrategy.initialSoplossPositionalPrecent;
            basePrice = openPrice + (openPrice * (positionPercent / 100));
            basePercentChange = positionPercent;
        }

        const stoplossPercent = basePercentChange + initialStopLossPercent;
        // const stoplossPercent = openPercentChange + QuickShortStrategy.initialSoplossPrecent;
        let triggerPrice = basePrice + openPrice * (stoplossPercent / 100);
        console.log('Raghav', openPrice, openPercentChange, stoplossPercent, triggerPrice);
        return this._getRoundedPrice(triggerPrice);
    }

    private async _checkAndUpdateSL(shortInstrumentData: ShortInstrumentPayload
        , instrumentMeta: ShortInstrumentMeta
        , tickerData: TickerData): Promise<void> {
        const sellOrder: OrderUpdatePayload = QuickShortStrategy.instrumentToShortOrderMapping[shortInstrumentData.instrumentId];
        const slmOrder: OrderUpdatePayload = QuickShortStrategy.instrumentToSLMOrderMapping[shortInstrumentData.instrumentId];
        if (slmOrder && instrumentMeta) {
            const { order_id, trigger_price } = slmOrder;
            const { last_price, change } = tickerData;
            const distance = sellOrder.average_price - last_price;
            const { positionPercent } = instrumentMeta;
            const percentageChange = (positionPercent || 0) - change;
            if (distance > 0) {
                // const triggerPricePercent = positionPercent ? 
                if (percentageChange >= 2) {
                    console.log(shortInstrumentData.tradingSymbol + ' :: ', chalk.white.bgYellow.bold('Trail stoploss'));
                } else if (percentageChange >= 1.5) {
                    // If profit goes above 1% modify SL at the initial position taken
                    console.log(shortInstrumentData.tradingSymbol + ' :: ', chalk.white.bgYellow.bold('Initial position SL'));
                }
                // in profit, as last_price is less than the sell value
                console.log(shortInstrumentData.tradingSymbol + ' :: ', chalk.white.bgGreen.bold(percentageChange));
                // console.log(shortInstrumentData.tradingSymbol + ' :: PROFIT :: ', percentageChange);
            } else {
                console.log(shortInstrumentData.tradingSymbol + ' :: ', chalk.white.bgRed.bold(percentageChange));
                // console.log(shortInstrumentData.tradingSymbol + ' :: LOSS', percentageChange);
            }
        }
        return Promise.resolve();
    }

    // x + x * (percent/100) = openPrice
    // x * (1 + (percent/100)) = openPrice
    // x * ((100 + percent) / 100) = openPrice
    // x = (openPrice * 100) / (100 + percent)
    private async _checkAndUpdateInstrumentMetaData(tickerData: TickerData) {
        // 1. check and update the initial percentage change
        if (!QuickShortStrategy.instrumentToMetaMapping[tickerData.instrument_token]) {
            const openPrice = tickerData.ohlc.open;
            const percentChange = tickerData.change;
            // const previousClose = (openPrice * 100) / (100 + percentChange);
            const previousClose = tickerData.ohlc.close;
            QuickShortStrategy.instrumentToMetaMapping[tickerData.instrument_token] = {
                openPrice: openPrice,
                percentChange,
                previousClose
            }
        }
    }

    private async _updateOrderIfRequired(tickerData: TickerData) {
        try {
            const shortInstrumentData: ShortInstrumentPayload = SHORTS_MAP[tickerData.instrument_token];
            const instrumentMeta: ShortInstrumentMeta = QuickShortStrategy.instrumentToMetaMapping[tickerData.instrument_token];
            // 2. check if there is an existing SLM slmOrder. If NOT place one
            if (QuickShortStrategy.instrumentToShortOrderMapping[tickerData.instrument_token]
                && !QuickShortStrategy.instrumentToSLMOrderMapping[tickerData.instrument_token]
                && !QuickShortStrategy.slmOrders.has(tickerData.instrument_token)) {

                // This is the initial stop loss
                await this._placeInitialStopLossOrder(shortInstrumentData, instrumentMeta);
            } else {
                // 3. on every tick update compare the percentage change with current percent change
                // ** IMP IMP
                await this._checkAndUpdateSL(shortInstrumentData, instrumentMeta, tickerData);
            }
        } catch (e) {
            // console.log('Ticker Data' + ' :: ', chalk.white.bgRed.bold('ERROR'));
        }
    }

    protected processTickerData(data: TickerData): void {
        this._checkAndUpdateInstrumentMetaData(data);
        this._updateOrderIfRequired(data);
        /**
         * 1. check and update the initial percentage change
         * 2. check if there is an existing SLM slmOrder. If NOT place one
         * 3. on every tick update compare the percentage change with current percent change
         * 
         */
        // console.log('Raghav', data);
    }

}