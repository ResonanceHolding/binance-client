declare const _exports: {
    assignMethodToUrl: (url: any, method: any) => string;
    assignSymbolsToUrl: (url: any, symbols: any) => string;
    getSymbolsInfo: (symbols: string[]) => Promise<any>;
    wrapToErrResult: (fn: any, args: any) => Promise<{
        err: unknown;
        res: any;
    }>;
    Limiter: typeof http.Limiter;
    getBinanceSymbolsInfo: (args: any) => Promise<any>;
    aggTrade: (msg: import("./types.js").AggTradeResponse, market: import("./types.js").Market, exchange: string) => import("./types.js").Trade;
    trade: (msg: import("./types.js").RawTradeResponse, market: import("./types.js").Market, exchange: string) => import("./types.js").Trade;
    symbolsInfo: (exchange: any, symbolsInfo: any) => any[];
    LegacyClient: typeof client.LegacyClient;
    BinanceWssApi: typeof client.BinanceWssApi;
};
export = _exports;
import http = require("./http.js");
import client = require("./client.js");
