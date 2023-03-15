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
    const { request_token } = req.query;
    if (!request_token) {
        return res.status(401).send('Unauthorized')
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
    } catch (error) {
        const { response: fetchResponse } = error
        res.status(fetchResponse?.status || 500).json(error.data)
    }

});