/// <reference types="node" />
export type Market = import('./types').TickerTaskData;
export type Channel = import('node:events').EventEmitter;
export class BinanceWssApi {
    /**
     * Binance Wss API - responsible for binance WSS API
     * @param {string | URL} baseUrl
     * @param {Pick<Channel, 'emit'>} channel
     * @param {[string, Market][]} marketStreams
     */
    constructor(baseUrl: string | URL, channel: Pick<Channel, 'emit'>, marketStreams: [string, Market][]);
    connected: boolean;
    active: boolean;
    exchange: string;
    reconnectAttempts: number;
    reconnectTimeout: number;
    reconnectsDone: number;
    channel: Pick<import("events"), "emit">;
    marketStreams: Map<string, import("./types").TickerTaskData>;
    wssUrl: string;
    /**
     * open - open wss api connection
     */
    open: () => void;
    /**
     * close - close wss api connection
     */
    close: () => void;
    /**
     * ready - wait until websocket connection is ready
     * @returns {Promise<void>}
     */
    ready: () => Promise<void>;
    /**
     * sucbscribe - accepts an array of binance marketStreams in lower case
     * and id which binance use to identify request via websocket
     * result:
     *    side effect, subscribes to streams
     *    then socket will start receiving messages from binance streams
     * @type {(marketStreams: [string, Market][], id: number) => void}
     */
    subscribe: (marketStreams: [string, Market][], id: number) => void;
    /**
     * unsucbscribe - accepts an array of binance marketStreams in lower case
     * and id which binance use to identify request via websocket
     * result: side effect, unsubscribes from streams
     * example args: (marketStreams: ['achbusd@aggTrade', 'achbusd@trade'], id: 10)
     * @type {(marketStreams: [string, Market][], id: number) => void}
     */
    unsubscribe: (marketStreams: [string, Market][], id: number) => void;
    #private;
}
/** @type {(baseUrl: string, streams?: string[]) => string} */
export const createWssUrl: (baseUrl: string, streams?: string[]) => string;
