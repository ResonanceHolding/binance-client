export class Trade {
    constructor(props: any);
    exchange: any;
    quote: any;
    base: any;
    tradeId: any;
    sequenceId: any;
    unix: any;
    side: any;
    price: any;
    amount: any;
    buyOrderId: any;
    sellOrderId: any;
    get marketId(): string;
}
export function transformAggTrade(msg: import('./types').AggTradeResponse, market: import('./types').Market, exchange: string): Trade;
export function transformRawTrade(msg: import('./types').RawTradeResponse, market: import('./types').Market, exchange: string): Trade;
