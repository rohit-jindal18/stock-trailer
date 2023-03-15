export interface KiteProfile {
    user_id: string
    user_name: string
    user_shortname?: string
    user_type: string
    email: string
    broker: string
    exchanges: string[]
    products: string[]
    order_types: string[]
    api_key?: string
    access_token?: string
    refresh_token?: string
    login_time?: string
    avatar_url: string
}

export interface StockTrailerUser {
    sessionData: KiteProfile,
    isLoggedIn: boolean
}