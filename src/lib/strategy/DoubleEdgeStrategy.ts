import { OptionType, TickerData } from "../models";
import { getNearestOptionValue } from "../utils/helper";
import BaseStrategy from "./BaseStrategy";

export class DoubleEdgeStrategy extends BaseStrategy {
    private static readonly STRATEGY_ID = 1;

    public getStrategyId(): number {
        return DoubleEdgeStrategy.STRATEGY_ID;
    }

    protected initialize = (): void => {
        const currentNiftyValue = this.delegate.getCurrentNiftyValue();
        const instrumentData = this.delegate.getInstrumentData();
        if (currentNiftyValue > -1) {
            const { weeklyExpiry, monthlyExpiry } = getNearestOptionValue(currentNiftyValue);
            let callOption;
            let putOption;
            let callOptionInstrument;
            let putOptionInstrument;
            callOption = `${weeklyExpiry}${OptionType.CE}`;
            putOption = `${weeklyExpiry}${OptionType.PE}`;
            if (instrumentData[callOption] && instrumentData[putOption]) {
                callOptionInstrument = instrumentData[callOption]?.instrument_token;
                putOptionInstrument = instrumentData[putOption]?.instrument_token;
            } else {
                callOption = `${monthlyExpiry}${OptionType.CE}`;
                putOption = `${monthlyExpiry}${OptionType.PE}`;
                callOptionInstrument = instrumentData[callOption]?.instrument_token;
                putOptionInstrument = instrumentData[putOption]?.instrument_token;
            }

            if (callOptionInstrument && putOptionInstrument) {

            }
        }
    }

    protected processTickerData(data: TickerData): void {

    }

}