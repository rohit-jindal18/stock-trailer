import { NextApiRequest, NextApiResponse } from "next";
// @ts-ignore
import { KiteConnect } from 'kiteconnect';

const apiKey = process.env.KITE_API_KEY
const kiteSecret = process.env.KITE_API_SECRET
const kc = new KiteConnect({
    api_key: apiKey
})

export default function authorizeKite(req: NextApiRequest, res: NextApiResponse) {
    const { request_token } = req.query;
    if (!request_token) {
        return res.status(401).send('Unauthorized')
    }


}