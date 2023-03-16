import { Exchange, Instrument, Quote } from "../models";
import BaseAnalyzer from "./BaseAnalyzer";
import chalk from 'chalk';

interface InstrumentMod extends Instrument {
    quote: Quote;
    percentChange: number;
    currentPercentOP?: number;
}


export default class QuickShortAnalyzer extends BaseAnalyzer {

    private static readonly blackListedSymbolSuffix: Set<string> = new Set(['SG', 'GS', 'TB', 'N6'
        , 'NW', 'GB', 'SM', 'BZ', 'NC', 'ND'
        , 'NAV', 'IT', 'BE', 'P1', 'W1', 'E1', 'IV', 'X1'
        , 'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'NI'
        , 'Y7'
    ]);

    protected initialize(): void {
        // console.log('SLM Trade :: ', chalk.whiteBright.bgGreen.bold('Test'));
        this._processInstruments();
    }


    private async _getQuotes(tradingSymbols: string[]): Promise<Record<string, Quote>> {
        const quotes: Record<string, Quote> = {};
        const batchSize = 500;
        try {
            for (let i = 0; i < tradingSymbols.length; i = i + batchSize) {
                const end = i + batchSize > tradingSymbols.length ? tradingSymbols.length : i + batchSize;
                const batch = tradingSymbols.slice(i, end);
                const batchQuotes: Record<string, Quote> = await this.tradeDelegate.getQuotes(batch);
                for (let ts of Object.keys(batchQuotes)) {
                    quotes[ts] = batchQuotes[ts];
                }
            }
        } catch (e) {
            // console.log('Raghav ERROR :: ', JSON.stringify(e));
            return Promise.resolve(quotes);
        }
        return Promise.resolve(quotes);
    }

    private async _processInstruments() {
        try {
            // console.log('Raghav ::  Fetch EQ NSE Instruments')
            // 1. Fetch EQ NSE Instruments
            let instruments: Instrument[] = await this.tradeDelegate.getInstruments(Exchange.NSE);
            // console.log('Raghav ::  Filter out unwanted tradingSymbols and segments')
            // 2. Filter out unwanted tradingSymbols and segments
            instruments = instruments.filter((instrument: Instrument) => {
                const tokens = instrument.tradingsymbol && instrument.tradingsymbol.split('-');
                let suffix;
                if (tokens && tokens.length > 1) {
                    suffix = tokens[tokens.length - 1];
                }

                if (suffix && !QuickShortAnalyzer.blackListedSymbolSuffix.has(suffix)) {
                    // console.log('Raghav', suffix);
                }
                return instrument.tradingsymbol
                    && instrument.segment === 'NSE'
                    && (!suffix || !QuickShortAnalyzer.blackListedSymbolSuffix.has(suffix));
            });
            // console.log('Raghav ::  Contsruct keys for fetching quotes', instruments.length);
            // 3. Contsruct keys for fetching quotes
            const instrumentDataMap: Record<number, string> = {};
            const instrumentTokens: string[] = instruments.map((instrument: Instrument, index: number) => {
                const tsKey = `${instrument.exchange}:${instrument.tradingsymbol}`;
                instrumentDataMap[index] = tsKey;
                return tsKey;
            });
            // console.log('Raghav ::  Fetch Quotes for instruments')
            // 4. Fetch Quotes for instruments
            // const quotes: Record<string, Quote> = await this.tradeDelegate.getQuotes(instrumentTokens);
            const quotes: Record<string, Quote> = await this._getQuotes(instrumentTokens);
            // console.log('Raghav ::  Unify data at one place for sorting')
            // 5. Unify data at one place for sorting
            let instrumentsWithQuotes: InstrumentMod[] = instruments.map((instrument: Instrument, index: number) => {
                const quote = quotes[instrumentDataMap[index]];
                const percentChange = ((quote.ohlc.open - quote.ohlc.close) / quote.ohlc.close) * 100;
                return {
                    ...instrument,
                    quote,
                    percentChange
                };
            });

            instrumentsWithQuotes = instrumentsWithQuotes.filter((i: InstrumentMod) => {
                return i.percentChange > 0;
            });


            // 6. Sort instrument quotes based on the OHLC logic
            instrumentsWithQuotes.sort((a: InstrumentMod, b: InstrumentMod) => {
                return b.percentChange - a.percentChange;
            });

            const temp: { symbol: string, percent: number, currentChange?: number, gainPercent?: number }[] = instrumentsWithQuotes.map((i: InstrumentMod) => {
                const currentPrice = i.quote.last_price;
                const currentChange = ((currentPrice - i.quote.ohlc.close) / i.quote.ohlc.close) * 100;
                return {
                    symbol: i.tradingsymbol,
                    percent: i.percentChange,
                    currentChange: currentChange,
                    pl: i.percentChange - currentChange
                };
            });


            // console.log('Raghav', JSON.stringify(temp.slice(0, 9)));

            // console.log('Raghav', JSON.stringify(instrumentsWithQuotes.slice(0, 9)));
        } catch (e) {
            // console.log('Raghav', JSON.stringify(e));
        }
    }

}

/**
 * private _getInitialStoploss(shortInstrumentData: ShortInstrumentPayload, instrumentMeta: ShortInstrumentMeta): number {
        const { openPrice, previousClose, positionPercent } = instrumentMeta;
        const openPercentChange = ((openPrice - previousClose) / previousClose) * 100;
        let stoplossPercent = openPercentChange + QuickShortStrategy.initialSoplossPrecent;
        if (positionPercent) {
            console.log('Raghav :: positionPercent : ', positionPercent);
            if (positionPercent > openPercentChange) {
                // Case where position is above OPEN (high posibility of wrong trade)
                stoplossPercent = openPercentChange + QuickShortStrategy.initialSoplossPrecent;
                console.log('Raghav :: wrong trade : ', stoplossPercent);
            } else {
                stoplossPercent = Math.max(openPercentChange, positionPercent + QuickShortStrategy.initialSoplossPrecent);
                console.log('Raghav :: wrong trade : ', stoplossPercent);
            }
        }
        let triggerPrice = previousClose + previousClose * (stoplossPercent / 100);
        console.log('Raghav', openPrice, openPercentChange, stoplossPercent, triggerPrice);
        return this._getRoundedPrice(triggerPrice);
    }
 */