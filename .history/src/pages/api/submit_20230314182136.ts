import { NextApiRequest, NextApiResponse } from "next";
// @ts-ignore
import { KiteConnect } from 'kiteconnect';
import withSession from "@stock-trailer/lib/session";
import { KiteProfile, StockTrailerUser } from "@stock-trailer/types";
import qsMemoryCache from "@stock-trailer/lib/cache/QSMemoryCache";

const apiKey = process.env.KITE_API_KEY
const kiteSecret = process.env.KITE_API_SECRET
const kc = new KiteConnect({
    api_key: apiKey
})

export default withSession(async (req: any, res: NextApiResponse) => {
    const { instruments } = req.body;
    if (!instruments) {
        return res.status(400).send('Instruments not present');
    }
    try {
        qsMemoryCache.storeQSInstruments(instruments);
        // then redirect
        res.send(200);
    } catch (error: any) {
        const { response: fetchResponse } = error
        res.status(fetchResponse?.status || 500).json(error.data)
    }
});