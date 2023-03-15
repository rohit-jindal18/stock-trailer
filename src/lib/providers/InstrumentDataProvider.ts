import { parse } from "csv-parse";
import { InstrumentInfo } from "../models";
import BaseDataProvider from "./BaseDataProvider";
var fs = require('fs');

class InstrumentDataProvider extends BaseDataProvider<Record<string, InstrumentInfo>> {
    // KITE INSTRUMENTS
    // https://api.kite.trade/instruments
    private static readonly INSTRUMENT_INFO_FILE_PATH = './assets/processed_instruments.csv'

    protected prepareData(): Promise<Record<string, InstrumentInfo> | undefined> {
        return new Promise(async (resolve, reject) => {
            try {
                const records: Record<string, InstrumentInfo> = {};
                const parser = fs
                    .createReadStream(InstrumentDataProvider.INSTRUMENT_INFO_FILE_PATH)
                    .pipe(parse({
                        columns: true
                    }));
                for await (const record of parser) {
                    // Work with each record
                    const instrumentData = record as InstrumentInfo;
                    if (instrumentData && instrumentData.tradingsymbol) {
                        records[instrumentData.tradingsymbol] = instrumentData;
                    }
                }
                resolve(records);
            } catch (e) {
                reject(e);
            }
        })
    }
}

export default new InstrumentDataProvider();