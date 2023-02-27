export type IClient = import('./types').CcxwsClient;
export type TickerTaskData = import('./types').TickerTaskData;
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
    streamQueue: {
        subscribe: string[];
        unsubscribe: string[];
    };
    diagnosticChannel: DiagnosticChannel;
    connectApi: () => any;
    collectMarkets: (market: any) => void;
    /** @type {(market: TickerTaskData) => Promise<void>} */
    subscribeTrades: (market: TickerTaskData) => Promise<void>;
    /** @type {(data: TickerTaskData) => Promise<void>} */
    unsubscribeTrades: (data: TickerTaskData) => Promise<void>;
}
import { EventEmitter } from "events";
import { DiagnosticChannel } from "./diagnostic.js";
