import { Quote, Instrument, Exchange } from "../models";
import BaseAnalyzer from "./BaseAnalyzer";
import QuickLongAnalyzer from "./QuickLongAnalyzer";

interface InstrumentMod extends Instrument {
    quote: Quote;
    percentChange: number;
}

export default class BTSTAnalyzer extends BaseAnalyzer {
    
    private static readonly blackListedSymbolSuffix: Set<string> = new Set(['SG', 'GS', 'TB', 'N6'
        , 'NW', 'GB', 'SM', 'BZ', 'NC'
        , 'NAV', 'IT', 'BE', 'P1', 'W1', 'E1', 'IV', 'X1'
        , 'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'NI'
    ]);

    protected initialize(): void {
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
            console.log('Raghav ERROR :: ', JSON.stringify(e));
            return Promise.resolve(quotes);
        }
        return Promise.resolve(quotes);
    }

    private async _processInstruments() {
        try {
            console.log('Raghav ::  Fetch EQ NSE Instruments')
            // 1. Fetch EQ NSE Instruments
            let instruments: Instrument[] = await this.tradeDelegate.getInstruments(Exchange.NSE);
            console.log('Raghav ::  Filter out unwanted tradingSymbols and segments')
            // 2. Filter out unwanted tradingSymbols and segments
            instruments = instruments.filter((instrument: Instrument) => {
                const tokens = instrument.tradingsymbol && instrument.tradingsymbol.split('-');
                let suffix;
                if (tokens && tokens.length > 1) {
                    suffix = tokens[tokens.length - 1];
                }

                return instrument.tradingsymbol
                    && instrument.segment === 'NSE'
                    && (!suffix || !BTSTAnalyzer.blackListedSymbolSuffix.has(suffix));
            });
            console.log('Raghav ::  Contsruct keys for fetching quotes', instruments.length);
            // 3. Contsruct keys for fetching quotes
            const instrumentDataMap: Record<number, string> = {};
            const instrumentTokens: string[] = instruments.map((instrument: Instrument, index: number) => {
                const tsKey = `${instrument.exchange}:${instrument.tradingsymbol}`;
                instrumentDataMap[index] = tsKey;
                return tsKey;
            });
            console.log('Raghav ::  Fetch Quotes for instruments')
            // 4. Fetch Quotes for instruments
            // const quotes: Record<string, Quote> = await this.tradeDelegate.getQuotes(instrumentTokens);
            const quotes: Record<string, Quote> = await this._getQuotes(instrumentTokens);
            console.log('Raghav ::  Unify data at one place for sorting')
            // 5. Unify data at one place for sorting
            let instrumentsWithQuotes: InstrumentMod[] = instruments.map((instrument: Instrument, index: number) => {
                const quote = quotes[instrumentDataMap[index]];
                const percentChange = ((quote.ohlc.open - quote.last_price) / quote.ohlc.close) * 100;
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

            const temp: { symbol: string, percent: number }[] = instrumentsWithQuotes.map((i: InstrumentMod) => {
                return { symbol: i.tradingsymbol, percent: i.percentChange };
            });

            console.log('Raghav', JSON.stringify(temp));

            // console.log('Raghav', JSON.stringify(instrumentsWithQuotes.slice(0, 9)));
        } catch (e) {
            console.log('Raghav', JSON.stringify(e));
        }
    }
    
}

/**
 * {
    "symbol": "MONARCH",
    "percent": 15.187463386057418
  },
  {
    "symbol": "ATGL",
    "percent": 15
  },
  {
    "symbol": "ITDCEM",
    "percent": 13.503649635036503
  },
  {
    "symbol": "ACC",
    "percent": 13.395207092395076
  },
 */