// @ts-ignore
import withSession from '@/lib/session';
import { KiteConnect } from 'kiteconnect';
import { NextApiRequest, NextApiResponse } from 'next';

const kc = new KiteConnect({
    api_key: process.env.KITE_API_KEY
})

export default withSession(async (req: NextApiRequest, res: NextApiResponse) => {
    const user = req.session.get('user');

    if (!user) {
        return res.redirect(kc.getLoginURL());
    }

    return res.redirect('/home');
}
);
