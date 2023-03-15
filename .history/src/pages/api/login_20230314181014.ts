import initializeController from '@stock-trailer/lib/main';
import withSession from '@stock-trailer/lib/session';
// @ts-ignore
import { KiteConnect } from 'kiteconnect';
import { NextApiResponse } from 'next';

const kc = new KiteConnect({
    api_key: process.env.KITE_API_KEY
})

export default withSession(async (req: any, res: NextApiResponse) => {
    const user = req.session?.get('user');

    if (!user) {
        return res.redirect(kc.getLoginURL());
    }

    // Initializing server
    console.log("user", user);
    initializeController(user);

    return res.redirect('/home');
}
);
