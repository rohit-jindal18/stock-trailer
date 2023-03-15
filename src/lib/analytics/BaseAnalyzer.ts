import { ITradeDelegate } from "../controller/TradingController";

export default abstract class BaseAnalyzer {
    protected tradeDelegate: ITradeDelegate;

    constructor(delegate: ITradeDelegate){
        this.tradeDelegate = delegate;
        this.init();
    }

    private init = () => {
        this.initialize();
    }

    protected abstract initialize(): void;

}