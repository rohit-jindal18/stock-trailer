import { NextApiRequest, NextApiResponse } from "next";
// @ts-ignore
import { KiteConnect } from 'kiteconnect';
import withSession from "@stock-trailer/lib/session";
import { KiteProfile, StockTrailerUser } from "@stock-trailer/types";

const apiKey = process.env.KITE_API_KEY
const kiteSecret = process.env.KITE_API_SECRET
const kc = new KiteConnect({
    api_key: apiKey
})

export default withSession(async (req: any, res: NextApiResponse) => {
    const { instruments } = req.body;
    if (!instruments) {
        return res.status(400).send('Insutrments not present');
    }
    try {
        const sessionData: KiteProfile = await kc.generateSession(
            request_token,
            kiteSecret
        )
        const user: StockTrailerUser = { isLoggedIn: true, session: sessionData }
        req.session.set('user', user)
        await req.session.save()

        // then redirect
        res.redirect('/home')
    } catch (error: any) {
        const { response: fetchResponse } = error
        res.status(fetchResponse?.status || 500).json(error.data)
    }
});