import { initializeController } from '@stock-trailer/lib/main';
import { StockTrailerUser } from '@stock-trailer/types';
// @ts-ignore
import { KiteConnect } from 'kiteconnect';
import withSession from '../../lib/session';

const apiKey = process.env.KITE_API_KEY

export default withSession(async (req: any, res: any) => {

    const user: StockTrailerUser = req.session.get('user')

    if (user) {
        const kc = new KiteConnect({
            api_key: apiKey,
            access_token: user?.session?.access_token
        })
        initializeController(user);
        try {
            // see if we're able to fetch profile with the access token
            // in case access token is expired, then log out the user
            await kc.getProfile()
            res.json({
                ...user,
                isLoggedIn: true
            })
        } catch (e) {
            req.session.destroy()
            res.json({
                isLoggedIn: false
            })
        }
    } else {
        res.json({
            isLoggedIn: false
        })
    }
})