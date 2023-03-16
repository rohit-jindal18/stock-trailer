import { CancelOrderPayload, InstrumentInfo, PlaceOrderPayload, PlaceOrderResponse, TickerData } from "../models";
import BaseStrategy from "../strategy/BaseStrategy";
import { DoubleEdgeStrategy } from "../strategy/DoubleEdgeStrategy";
import { QuickShortStrategy } from "../strategy/QuickShortStrategy";
import { NIFTY_INDEX_TOKEN } from "../utils/constants";
import BaseManager from "./BaseManager";
import { OrderManager } from "./OrderManager";

export interface IStrategyDelegate {
    subscribeToInstrument(instrumentId: number, strategy: BaseStrategy): void;
    unSubscribeToInstrument(instrumentId: number, strategy: BaseStrategy): void;
    exitStrategy(strategy: BaseStrategy): void;
    placeOrder(placeOrderPayload: PlaceOrderPayload): Promise<PlaceOrderResponse>;
    exitOrder(orderPayload: CancelOrderPayload): Promise<PlaceOrderResponse>;
    updateOrder(orderPayload: PlaceOrderPayload): Promise<PlaceOrderResponse>;
    getCurrentNiftyValue(): number;
    getOrderManager(): OrderManager | undefined;
    getInstrumentData(): Record<string, InstrumentInfo>;
}

export class StrategyManager extends BaseManager implements IStrategyDelegate {
    private static strategyMap: Record<number, BaseStrategy> = {};
    private static subscriptionToStrategyIdMap: Record<number, number[]> = {};
    private initialNtiftyValue = -1;
    private currentNiftyValue = -1;

    protected initialize(): void {
        // this.tradeDelegate.subscribeToInstrument(NIFTY_INDEX_TOKEN);
        const quickShortStrategy = new QuickShortStrategy(this);
        StrategyManager.strategyMap[quickShortStrategy.getStrategyId()] = quickShortStrategy;
    }

    public onTickerUpdate(tickerData: TickerData[]): void {
        for (let tick of tickerData) {
            const { instrument_token } = tick;
            if (+instrument_token === NIFTY_INDEX_TOKEN) {
                this._updateNiftyData(tick);
            }
            const strategyIds = StrategyManager.subscriptionToStrategyIdMap[+instrument_token];
            if (strategyIds) {
                for (let strategyId of strategyIds) {
                    console.log("ticker update");
                    StrategyManager.strategyMap[strategyId]?.onTickerUpdate(tick);
                }
            }
        }
    }

    private _updateNiftyData(tickerData: TickerData) {
        this.currentNiftyValue = tickerData.last_price;
        if (this.initialNtiftyValue === -1) {
            this.initialNtiftyValue = tickerData.last_price;
            // this._executeInitialStrategy();
        }
    }

    private _executeInitialStrategy() {
        const doubleEdgeStrategy = new DoubleEdgeStrategy(this);
        StrategyManager.strategyMap[doubleEdgeStrategy.getStrategyId()] = doubleEdgeStrategy;
    }

    subscribeToInstrument(instrumentId: number, strategy: BaseStrategy): void {
        const strategyId: number = strategy.getStrategyId();
        let newSubscription = false;

        if (!StrategyManager.strategyMap[strategyId]) {
            StrategyManager.strategyMap[strategyId] = strategy;
        }

        const subscribedStrategies = StrategyManager.subscriptionToStrategyIdMap[instrumentId];
        if (subscribedStrategies) {
            if (subscribedStrategies.indexOf(strategyId) < 0) {
                StrategyManager.subscriptionToStrategyIdMap[instrumentId] = subscribedStrategies.concat(strategyId);
                newSubscription = true;
            }
        } else {
            StrategyManager.subscriptionToStrategyIdMap[instrumentId] = [strategyId];
            newSubscription = true;
        }
        if (newSubscription) {
            this.tradeDelegate.subscribeToInstrument(instrumentId);
        }
    }

    unSubscribeToInstrument(instrumentId: number, strategy: BaseStrategy): void {
        const strategyId: number = strategy.getStrategyId();

        const subscribedStrategies = StrategyManager.subscriptionToStrategyIdMap[instrumentId];
        if (subscribedStrategies) {
            const index = subscribedStrategies.indexOf(strategyId);
            if (index > -1) {
                StrategyManager.subscriptionToStrategyIdMap[instrumentId] = subscribedStrategies.splice(index, 1);
            }
        }
    }

    getCurrentNiftyValue(): number {
        return this.currentNiftyValue;
    }

    exitStrategy(strategy: BaseStrategy): void {
        for (let instrumentId of strategy.getSubscribedInstruments()) {
            this.unSubscribeToInstrument(instrumentId, strategy);
        }
        delete StrategyManager.strategyMap[strategy.getStrategyId()];
    }

    placeOrder(placeOrderPayload: PlaceOrderPayload): Promise<PlaceOrderResponse> {
        return this.tradeDelegate.placeOrder(placeOrderPayload);
    }

    exitOrder(orderPayload: CancelOrderPayload): Promise<PlaceOrderResponse> {
        return this.tradeDelegate.exitOrder(orderPayload);
    }

    updateOrder(orderPayload: PlaceOrderPayload): Promise<PlaceOrderResponse> {
        return this.tradeDelegate.updateOrder(orderPayload);
    }

    getOrderManager(): OrderManager | undefined {
        return this.tradeDelegate.getOrderManager();
    }

    getInstrumentData(): Record<string, InstrumentInfo> {
        return this.tradeDelegate.getInstrumentData();
    }

}