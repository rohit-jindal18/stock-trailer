import { withIronSession } from 'next-iron-session'

export default function withSession(fn: any) {
    return withIronSession(fn, {
        cookieName: 'stock-trailer/session',
        password: process.env.COOKIE_PASSWORD!,
        cookieOptions: {
            // the next line allows to use the session in non-https environments like
            // Next.js dev mode (http://localhost:3000)
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1 * 24 * 60 * 60 // 1 day
        }
    });
}