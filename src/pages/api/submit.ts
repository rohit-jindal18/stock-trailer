import qsMemoryCache from "@stock-trailer/lib/cache/QSMemoryCache";
import { Exchange, Instrument } from "@stock-trailer/lib/models";
import withSession from "@stock-trailer/lib/session";
// @ts-ignore
import { KiteConnect } from 'kiteconnect';
import { NextApiResponse } from "next";
import fs from 'fs';

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
        const instrumentListString = fs.readFileSync('instruments.json', { encoding: 'utf-8' });
        const instrumentsList = JSON.parse(instrumentListString);
        const instrumentsMap = instrumentsList.reduce((map: any, instrument: Instrument, index: number) => ({
            ...map,
            [instrument.tradingsymbol]: instrument
        }), {});
        const validInstrumentList = instruments.map(i => {
            if (instrumentsMap[i.id]) {
                return {
                    ...i,
                    ...instrumentsMap[i.id],
                    instrumentId: instrumentsMap[i.id].instrument_token,
                    quantity: i.qty,
                    tradingSymbol: instrumentsMap[i.id].tradingsymbol,
                }
            }
            return null;
        }).filter(e => e);
        fs.writeFileSync('qsInstruments.txt', JSON.stringify(validInstrumentList));
        // qsMemoryCache.storeQSInstruments(validInstrumentList);
        // then redirect
        res.send(200);
    } catch (error: any) {
        const { response: fetchResponse } = error
        res.status(fetchResponse?.status || 500).json(error.data)
    }
});