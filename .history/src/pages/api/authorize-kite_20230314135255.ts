import { NextApiRequest, NextApiResponse } from "next";

export default function authorizeKite(req: NextApiRequest, res: NextApiResponse) {
    const { request_token } = req.query;
    if (!request_token) {
        return res.status(401).send('Unauthorized')
    }
}