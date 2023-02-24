/**
 * @implements {IClient}
 */
export class BinanceClient extends EventEmitter implements IClient {
    constructor();
    /** @type {(data: TickerTaskData) => Promise<void>} */
    subscribeTrades: (data: TickerTaskData) => Promise<void>;
    /** @type {(data: TickerTaskData) => Promise<void>} */
    unsubscribeTrades: (data: TickerTaskData) => Promise<void>;
}
export type IClient = import('./types').CcxwsClient;
export type TickerTaskData = import('./types').TickerTaskData;
import { EventEmitter } from "events";
