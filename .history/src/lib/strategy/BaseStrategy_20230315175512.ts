import { OrderUpdateListener } from "../manager/OrderManager";
import { IStrategyDelegate } from "../manager/StrategyManager";
import { OrderUpdatePayload, TickerData } from "../models";

export default abstract class BaseStrategy implements OrderUpdateListener {
    protected delegate: IStrategyDelegate;
    protected subscribedInstruments: number[] = [];

    constructor(delegate: IStrategyDelegate) {
        this.delegate = delegate;
        this.initialize();
    }

    onOrdersUpdated(orders: OrderUpdatePayload[]): void {

    }

    private _init = () => {
        this.initialize();
    }

    public onTickerUpdate = (data: TickerData) => {
        this.processTickerData(data);
    }

    public getSubscribedInstruments(): number[] {
        return this.subscribedInstruments;
    }

    protected abstract initialize(): void;
    protected abstract processTickerData(tickerData: TickerData): void;
    public abstract getStrategyId(): number;
}