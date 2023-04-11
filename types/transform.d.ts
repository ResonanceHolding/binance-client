/**
 * Transforms binance AggTrade data to a CCXWS format
 * @param {import('./types').AggTradeResponse} msg
 * @param {import('./types').Market} market
 * @param {string} exchange
 * @returns {import('./types').Trade}
 */
declare function transformAggTrade(msg: import('./types').AggTradeResponse, market: import('./types').Market, exchange: string): import('./types').Trade;
/**
 * Transforms binance Raw Trade data to a CCXWS format
 * @param {import('./types').RawTradeResponse} msg
 * @param {import('./types').Market} market
 * @param {string} exchange
 * @returns {import('./types').Trade}
 */
declare function transformRawTrade(msg: import('./types').RawTradeResponse, market: import('./types').Market, exchange: string): import('./types').Trade;
declare function transfromSymbolsInfo(exchange: any, symbolsInfo: any): any[];
export { transformAggTrade as aggTrade, transformRawTrade as trade, transfromSymbolsInfo as symbolsInfo };
