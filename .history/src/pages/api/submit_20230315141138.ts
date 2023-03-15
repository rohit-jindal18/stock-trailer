import { NextApiRequest, NextApiResponse } from "next";
// @ts-ignore
import { KiteConnect } from 'kiteconnect';
import withSession from "@stock-trailer/lib/session";
import { KiteProfile, StockTrailerUser } from "@stock-trailer/types";
import qsMemoryCache from "@stock-trailer/lib/cache/QSMemoryCache";
import { Exchange, Instrument } from "@stock-trailer/lib/models";
import tradingController, { getInstruments } from "@stock-trailer/lib/main";

const kc = new KiteConnect({
    api_key: process.env.KITE_API_KEY
})

export default withSession(async (req: any, res: NextApiResponse) => {
    const body = JSON.parse(req.body);
    const instruments = body?.instruments as {
        id: string,
        qty: number
    }[];
    if (!body?.instruments) {
        return res.status(400).send('Instruments not present');
    }
    try {
        const instrumentsList = await kc.getInstruments(Exchange.NSE);
        const instrumentsMap = instrumentsList.reduce((map: any, instrument: Instrument, index: number) => ({
            ...map,
            [instrument.tradingsymbol]: instrument
        }), {});
        const validInstrumentList = body?.instruments.map((in) => {
            return {
                ...in,
                ...instrumentsMap[in.id]
            }
        });
qsMemoryCache.storeQSInstruments(validInstrumentList);
// then redirect
res.send(200);
    } catch (error: any) {
    const { response: fetchResponse } = error
    res.status(fetchResponse?.status || 500).json(error.data)
}
});