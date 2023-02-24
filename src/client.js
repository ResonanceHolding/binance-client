/**
 * @typedef {import('./types').CcxwsClient} IClient
 * @typedef {import('./types').TickerTaskData} TickerTaskData
 *
 */

import { EventEmitter } from 'node:events';

/**
 * @implements {IClient}
 */
export class BinanceClient extends EventEmitter {
  constructor() {
    super();
  }

  /** @type {(data: TickerTaskData) => Promise<void>} */
  subscribeTrades = async (data) => {
    console.log(data);
    return;
  };

  /** @type {(data: TickerTaskData) => Promise<void>} */
  unsubscribeTrades = async (data) => {
    console.log(data);
    return;
  };

}
