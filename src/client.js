/**
 * @typedef {import('./types').CcxwsClient} IClient
 * @typedef {import('./types').Market} Market
 */

const { EventEmitter } = require('node:events');
const { BinanceWssApi } = require('./api.js');
const { mainBaseUrl } = require('./config.js');
const { DiagnosticChannel } = require('./diagnostic.js');
const { Err } = require('logger');

/**
 * marketToMarketStream - if market is not handled by wss api
 * tranfsorms market to market stream
 * @param {Market} market
 * @returns {[string, Market]}
 */
const marketToMarketStream = (market) => {
  const symbol = market.id.toLowerCase();
  const stream = symbol + '@aggTrade';
  return [stream, market];
};

/** @type {(markets: Market[]) => [string, Market][]} */
const marketStreamsFrom = (markets) => {
  const marketStreams = [];
  for (const market of markets) {
    const stream = marketToMarketStream(market);
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

  start = (markets) => {
    this.wssApi = new BinanceWssApi(mainBaseUrl, this, markets);
    this.listen();
    return this.wssApi.ready();
  };

  /**
   * addToRateLimitQueue - adds streams to rateLimitQueue
   * @param {string} method
   * @param {[string, Market][]} marketStreams
   */
  addToRateLimitQueue = (method, marketStreams) => {
    const err = 'Rate limit exceed 4 messages per call per second';
    this.emit('error', err);
    marketStreams.forEach(this.rateLimitQueue[method].push);
  };

  /**
   * call - generic method to call pub/sub apis
   * @param {string} method
   * @param {Market[]} markets
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
   * @param {Market} market
   */
  subscribeOne = (market) => {
    this.call('subscribe', [market]);
  };

  /**
   * subscribeMany - sub to many symbols (market format)
   * @param {Market[]} markets
   */
  subscribeMany = (markets) => {
    this.call('subscribe', markets);
  };

  /**
   * unsubscribeOne - unsub from one symbol (market format)
   * @param {Market} market
   */
  unsubscribeOne = (market) => {
    this.call('unsubscribe', [market]);
  };

  /**
   * unsubscribeMany - unsub from many symbols (market format)
   * @param {Market[]} markets
   */
  unsubscribeMany = (markets) => {
    this.call('unsubscribe', markets);
  };

  /** @type {(market: Market) => Promise<void>} */
  subscribeTrades = async (market) => this.subscribeOne(market);

  /** @type {(data: Market) => Promise<void>} */
  unsubscribeTrades = async (market) => this.unsubscribeOne(market);
}

module.exports = { LegacyClient, BinanceWssApi, DiagnosticChannel };
