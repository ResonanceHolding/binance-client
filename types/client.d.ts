export type IClient = import('./types').CcxwsClient;
export type TickerTask = import('./types').TickerTask;
export type TickerTaskData = import('./types').TickerTaskData;
export type TikerTaskOnlyData = Pick<TickerTask, 'data'>;
/**
 * @implements {IClient}
 */
export class LegacyClient extends EventEmitter implements IClient {
    constructor();
    wssApi: any;
    active: boolean;
    firstSub: boolean;
    callId: number;
    markets: any[];
    collected: boolean;
    maxMarkets: number;
    initTimeout: number;
    callInterval: number;
    limitCalls: number;
    callsDone: number;
    /** @type {{subscribe: string[], unsubscribe: string[]}} */
    rateLimitQueue: {
        subscribe: string[];
        unsubscribe: string[];
    };
    clearRateLimitQueue: () => void;
    startRateLimitJob: () => void;
    listen: () => void;
    /**
     *
     * @param {TickerTask[]} markets
     * @returns {Promise<void>}
     */
    start: (markets: TickerTask[]) => Promise<void>;
    /**
     * addToRateLimitQueue - adds streams to rateLimitQueue
     * @param {string} method
     * @param {[string, TickerTaskData][]} marketStreams
     */
    addToRateLimitQueue: (method: string, marketStreams: [string, TickerTaskData][]) => void;
    /**
     * call - generic method to call pub/sub apis
     * @param {string} method
     * @param {TikerTaskOnlyData[]} markets
     * @returns {void}
     */
    call: (method: string, markets: TikerTaskOnlyData[]) => void;
    /**
     * subscribeOne - sub to one symbol (market format)
     * @param {TickerTaskData} data
     */
    subscribeOne: (data: TickerTaskData) => void;
    /**
     * subscribeMany - sub to many symbols (market format)
     * @param {TickerTask[]} markets
     */
    subscribeMany: (markets: TickerTask[]) => void;
    /**
     * unsubscribeOne - unsub from one symbol (market format)
     * @param {TickerTaskData} data
     */
    unsubscribeOne: (data: TickerTaskData) => void;
    /**
     * unsubscribeMany - unsub from many symbols (market format)
     * @param {TickerTask[]} markets
     */
    unsubscribeMany: (markets: TickerTask[]) => void;
    /** @type {(market: TickerTaskData) => Promise<void>} */
    subscribeTrades: (market: TickerTaskData) => Promise<void>;
    /** @type {(data: TickerTaskData) => Promise<void>} */
    unsubscribeTrades: (data: TickerTaskData) => Promise<void>;
}
import { BinanceWssApi } from "./api.js";
import { EventEmitter } from "events";
export { BinanceWssApi };
