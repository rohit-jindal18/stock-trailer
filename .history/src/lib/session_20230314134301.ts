import { withIronSession } from 'next-iron-session'

export default function withSession(fn) {
    return withIronSession(fn, {
        cookieName: 'stock-trailer/session',
        password: process.env.COOKIE_PASSWORD!
    });
}