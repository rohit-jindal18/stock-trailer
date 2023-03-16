import { INSTRUMENTS_MAP } from "@stock-trailer/constants";
import withSession from "@stock-trailer/lib/session";
import fs from 'fs';
// @ts-ignore
import { KiteConnect } from 'kiteconnect';
import { NextApiResponse } from "next";


const kc = new KiteConnect({
    api_key: process.env.KITE_API_KEY
})

export default withSession(async (req: any, res: NextApiResponse) => {
    const body = JSON.parse(req.body);
    const instruments = body?.instruments as {
        id: string,
        qty: number
    }[];
    if (!instruments) {
        return res.status(400).send('Instruments not present');
    }
    try {
        // const instrumentsMap = (INSTRUMENTS_MAP || []).reduce((map: any, instrument: Instrument, index: number) => ({
        //     ...map,
        //     [instrument.tradingsymbol]: {
        //         instrument_token: instrument.instrument_token,
        //         exchange_token: instrument.exchange_token,
        //         tradingsymbol: instrument.tradingsymbol,
        //     }
        // }), {});
        // console.log("map", JSON.stringify(instrumentsMap));
        const validInstrumentList = instruments.map(i => {
            if (INSTRUMENTS_MAP[i.id]) {
                return {
                    ...i,
                    ...INSTRUMENTS_MAP[i.id],
                    instrumentId: INSTRUMENTS_MAP[i.id].instrument_token,
                    quantity: i.qty,
                    tradingSymbol: INSTRUMENTS_MAP[i.id].tradingsymbol,
                }
            }
            return null;
        }).filter(e => e);
        fs.writeFileSync('/tmp/qsInstruments.txt', JSON.stringify(validInstrumentList));
        // qsMemoryCache.storeQSInstruments(validInstrumentList);
        // then redirect
        res.send(200);
    } catch (error: any) {
        // console.log("error", JSON.stringify(error));
        const { response: fetchResponse } = error
        res.status(fetchResponse?.status || 500).json(error.data)
    }
});