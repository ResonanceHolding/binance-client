/// <reference types="node" />
export type Market = import('./types').TickerTaskData;
export type Channel = import('node:events').EventEmitter;
export class BinanceWssApi {
    /**
     * Binance Wss API - responsible for binance WSS API
     * @param {string | URL} baseUrl
     * @param {Pick<Channel, 'emit'>} channel
     * @param {Market[]} markets
     * @param {string[]} streamTypes
     */
    constructor(baseUrl: string | URL, channel: Pick<Channel, 'emit'>, markets: Market[], streamTypes?: string[]);
    connected: boolean;
    active: boolean;
    exchange: string;
    reconnectAttempts: number;
    reconnectTimeout: number;
    reconnectsDone: number;
    channel: Pick<import("events"), "emit">;
    markets: Map<string, import("./types").TickerTaskData>;
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
     * sucbscribe - accepts an array of binance streams in lower case
     * and id which binance use to identify request via websocket
     * result:
     *    side effect, subscribes to streams
     *    then socket will start receiving messages from binance streams
     * example args: (lowerCaseStreams: ['achbusd@aggTrade', 'achbusd@trade'], id: 10)
     * @type {(lowerCaseStreams: string[], id: number) => void}
     */
    subscribe: (lowerCaseStreams: string[], id: number) => void;
    /**
     * unsucbscribe - accepts an array of binance streams in lower case
     * and id which binance use to identify request via websocket
     * result: side effect, unsubscribes from streams
     * example args: (lowerCaseStreams: ['achbusd@aggTrade', 'achbusd@trade'], id: 10)
     * @type {(lowerCaseStreams: string[], id: number) => void}
     */
    unsubscribe: (lowerCaseStreams: string[], id: number) => void;
    #private;
}
/** @type {(baseUrl: string, streams?: string[]) => string} */
export const createWssUrl: (baseUrl: string, streams?: string[]) => string;
