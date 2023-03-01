/**
 * @typedef {import('./types').CcxwsClient} IClient
 * @typedef {import('./types').TickerTask} TickerTask
 * @typedef {import('./types').TickerTaskData} TickerTaskData
 */

const { EventEmitter } = require('node:events');
const { BinanceWssApi } = require('./api.js');
const { mainBaseUrl } = require('./config.js');
const { DiagnosticChannel } = require('./diagnostic.js');
const { Err } = require('logger');

/**
 * marketToMarketStream - if TickerTaskData is not handled by wss api
 * tranfsorms market to market stream
 * @param {TickerTaskData} data
 * @returns {[string, TickerTaskData]}
 */
const marketToMarketStream = (data) => {
  const symbol = data.id.toLowerCase();
  const stream = symbol + '@aggTrade';
  return [stream, data];
};

/** @type {(markets: TickerTask[]) => [string, TickerTaskData][]} */
const marketStreamsFrom = (markets) => {
  const marketStreams = [];
  for (const { data } of markets) {
    const stream = marketToMarketStream(data);
    if (stream) marketStreams.push(stream);
  }
  return marketStreams;
};

/**
 * @implements {IClient}
 */
class LegacyClient extends EventEmitter {
  wssApi;
  active = false;
  firstSub = true;
  callId = 0;
  markets = [];
  collected = false;
  maxMarkets = 1024;
  initTimeout = 10000;
  callInterval = 1000;
  limitCalls = 3;
  callsDone = 0;
  /** @type {{subscribe: string[], unsubscribe: string[]}} */
  rateLimitQueue = { subscribe: [], unsubscribe: [] };

  constructor() {
    super();
    this.diagnosticChannel = new DiagnosticChannel(this);
  }

  clearRateLimitQueue = () => {
    for (const [method, marketStreams] of Object.entries(this.rateLimitQueue)) {
      if (marketStreams.length === 0) {
        return;
      } else {
        console.dir({ marketStreams });
      }
      this.wssApi[method]([marketStreams], ++this.callId);
      ++this.callsDone;
      this.diagnosticChannel.emit('call', { marketStreams, method, id: this.callId });
    }
  };

  startRateLimitJob = () => {
    const interval = setInterval(() => {
      this.callsDone = 0;
      this.clearRateLimitQueue();
    }, this.callInterval);

    this.on('close', () => clearInterval(interval));
    setTimeout(() => {
      this.collected = true;
    }, this.initTimeout);
  };

  listen = () => {
    this.on('error', (err) => Err(err));
    this.on('callback', (event) => {
      this.diagnosticChannel.emit('callback', event);
    });
    this.on('close', (e) => this.diagnosticChannel.emit('close', e));
    this.startRateLimitJob();
  };

  /**
   *
   * @param {TickerTask[]} markets
   * @returns {Promise<void>}
   */
  start = async (markets) => {
    const streamMarkets = marketStreamsFrom(markets);
    this.wssApi = new BinanceWssApi(mainBaseUrl, this, streamMarkets);
    await this.wssApi.ready();
    this.listen();
  };

  /**
   * addToRateLimitQueue - adds streams to rateLimitQueue
   * @param {string} method
   * @param {[string, TickerTaskData][]} marketStreams
   */
  addToRateLimitQueue = (method, marketStreams) => {
    const err = 'Rate limit exceed 4 messages per call per second';
    this.emit('error', err);
    marketStreams.forEach(this.rateLimitQueue[method].push);
  };

  /**
   * call - generic method to call pub/sub apis
   * @param {string} method
   * @param {TickerTask[]} markets
   * @returns {void}
   */
  call = (method, markets) => {
    if (!this.wssApi?.connected) {
      const err = `Cannot ${method} before ws connection is established`;
      Err(err);
      return void this.emit('error', err);
    }
    const marketStreams = marketStreamsFrom(markets);
    if (this.callsDone === this.limitCalls) {
      return void this.addToRateLimitQueue(method, marketStreams);
    }
    this.wssApi[method](marketStreams, ++this.callId);
    ++this.callsDone;
    this.diagnosticChannel.emit('call', { marketStreams, method, id: this.callId });
  };

  /**
   * subscribeOne - sub to one symbol (market format)
   * @param {TickerTask} market
   */
  subscribeOne = (market) => {
    this.call('subscribe', [market]);
  };

  /**
   * subscribeMany - sub to many symbols (market format)
   * @param {TickerTask[]} markets
   */
  subscribeMany = (markets) => {
    this.call('subscribe', markets);
  };

  /**
   * unsubscribeOne - unsub from one symbol (market format)
   * @param {TickerTask} market
   */
  unsubscribeOne = (market) => {
    this.call('unsubscribe', [market]);
  };

  /**
   * unsubscribeMany - unsub from many symbols (market format)
   * @param {TickerTask[]} markets
   */
  unsubscribeMany = (markets) => {
    this.call('unsubscribe', markets);
  };

  /** @type {(market: TickerTask) => Promise<void>} */
  subscribeTrades = async (market) => {
    console.dir({ market });
    return;
    if (!market) {

    }
    this.subscribeOne(market);
  };

  /** @type {(data: TickerTask) => Promise<void>} */
  unsubscribeTrades = async (market) => {
    console.dir({ market });
    return;

    this.unsubscribeOne(market);
  };
}

module.exports = { LegacyClient, BinanceWssApi, DiagnosticChannel };
