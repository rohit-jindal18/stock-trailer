export enum InstrumentType {
    CE = 'CE',
    PE = 'PE',
    EQ = 'EQ'
}

export interface InstrumentInfo {
    instrument_token: number;
    exchange_token: number;
    tradingsymbol: string;
    name: string;
}

export interface Instrument extends InstrumentInfo {
    last_price: number;
    tick_size: number;
    instrument_type: InstrumentType;
    exchange: Exchange;
    segment: string;
    expiry: number;
}

export enum InstrumentTickerMode {
    quote = 'quote'
}

export interface TickerData {
    tradable: boolean,
    mode: InstrumentTickerMode,
    instrument_token: number,
    last_price: number,
    last_traded_quantity: number,
    average_traded_price: number,
    volume_traded: number,
    total_buy_quantity: number,
    total_sell_quantity: number,
    ohlc: OHLC,
    change: number
}

export enum OrderVariety {
    bo = 'bo',
    co = 'co',
    amo = 'amo',
    regular = 'regular'
}

export enum OptionType {
    CE = 'CE', //CALL
    PE = 'PE'  // PUT
}

export enum Exchange {
    NSE = 'NSE',
    BSE = 'BSE',
    NFO = 'NFO',
    BFO = 'BFO',
    CDS = 'CDS',
    MCX = 'MCX'
}

export enum TransactionType {
    BUY = 'BUY',
    SELL = 'SELL'
}

export enum ProductCode {
    NRML = 'NRML',
    MIS = 'MIS',
    CNC = 'CNC',
}

export enum OrderType {
    NRML = 'NRML',
    SL = 'SL',
    SLM = 'SL-M',
    MARKET = 'MARKET',
}

export enum OrderValidity {
    DAY = 'DAY',
    IOC = 'IOC'
}

interface BaseOrderPayload {
    variety: OrderVariety;
    order_id?: string;
}

export interface PlaceOrderPayload extends BaseOrderPayload {
    exchange: Exchange;
    tradingsymbol: string;
    transaction_type: TransactionType;
    quantity: number;
    product: ProductCode;
    order_type: OrderType;
    validity: OrderValidity;
    price: number;
    disclosed_quantity?: number;
    trigger_price?: number;
    squareoff?: number;
    stoploss?: number;
    trailing_stoploss?: number;
    validity_ttl?: number;
    iceberg_legs?: number;
    iceberg_quantity?: number;
    tag?: string;
}

export enum OrderStatus {
    COMPLETE = 'COMPLETE',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
    TRIGGER_PENDING = 'TRIGGER PENDING'
}

export interface OrderUpdatePayload extends BaseOrderPayload {
    unfilled_quantity: number;
    order_id: string,
    status: OrderStatus,
    status_message: null,
    status_message_raw: null,
    order_timestamp: string,
    //   exchange_update_timestamp: '2023-01-19 09:36:00',
    //   exchange_timestamp: '2023-01-19 09:36:00',
    variety: OrderVariety,
    exchange: Exchange,
    tradingsymbol: string,
    instrument_token: number,
    order_type: OrderType,
    transaction_type: TransactionType,
    validity: OrderValidity,
    product: ProductCode,
    quantity: number,
    //   disclosed_quantity: 0,
    price: number,
    trigger_price: number;
    //imp
    average_price: number,
    // imp
    filled_quantity: number;
    pending_quantity: number;
    cancelled_quantity: number;
    market_protection: number;
}

export interface CancelOrderPayload extends BaseOrderPayload {

}

export interface PlaceOrderResponse {
    order_id: string;
}

export interface Depth {
    quantity: number;
    price: number;
    orders: number;
}
export interface MarketDepth {
    buy: Depth[];
    sell: Depth[];
}
export interface OHLC { open: number, high: number, low: number, close: number }

export interface Quote {
    volume: number;
    ast_quantity: number;
    last_trade_time: number;
    net_change: number;
    oi: number;
    sell_quantity: number;
    last_price: number;
    buy_quantity: number;
    ohlc: OHLC;
    instrument_token: number;
    timestamp: number;
    average_price: number;
    oi_day_high: number;
    oi_day_low: number;
    depth: MarketDepth;
    lower_circuit_limit: number;
    upper_circuit_limit: number;
}