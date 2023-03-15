import { NextApiRequest, NextApiResponse } from "next";
// @ts-ignore
import { KiteConnect } from 'kiteconnect';
import withSession from "@stock-trailer/lib/session";
import { KiteProfile, StockTrailerUser } from "@stock-trailer/types";
import qsMemoryCache from "@stock-trailer/lib/cache/QSMemoryCache";
import { Exchange } from "@stock-trailer/lib/models";
import tradingController from "@stock-trailer/lib/controller/TradingController";

export default withSession(async (req: any, res: NextApiResponse) => {
    const { instruments } = JSON.parse(req.body);
    console.log("req", req.body?.instruments, instruments, JSON.parse(req.body));
    if (!instruments) {
        return res.status(400).send('Instruments not present');
    }
    try {
        const instrumentsMap = await tradingController?.getProcessedInstruments(Exchange.NSE);
        console.log("insru", instrumentsMap, instruments, tradingController);
        qsMemoryCache.storeQSInstruments(instruments);
        console.log("instruments stored successfully");
        // then redirect
        res.send(200);
    } catch (error: any) {
        const { response: fetchResponse } = error
        res.status(fetchResponse?.status || 500).json(error.data)
    }
});