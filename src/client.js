/**
 * @typedef {import('./types').CcxwsClient} IClient
 * @typedef {import('./types').TickerTaskData} TickerTaskData
 *
 */

const { EventEmitter } = require('node:events');
const { BinanceWssApi } = require('./api.js');
const { mainBaseUrl } = require('./config.js');
const { DiagnosticChannel } = require('./diagnostic.js');
const { Err } = require('logger');

const symbolFromStreams = (streams) =>
  streams.map((stream) => stream.split('@')[0]).join(', ');

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
  streamQueue = { subscribe: [], unsubscribe: [] };

  constructor() {
    super();
    this.diagnosticChannel = new DiagnosticChannel(this);
  }

  connectApi = () => {
    this.wssApi = new BinanceWssApi(mainBaseUrl, this, this.markets);
    return this.wssApi.ready();
  };

  collectMarkets = (market) => {
    const count = this.markets.push(market);
    if (count === 1024) this.collected = true;
  };

  /** @type {(market: TickerTaskData) => Promise<void>} */
  subscribeTrades = async (market) => {
    if (!this.collected) {
      this.collectMarkets(market);
      if (this.firstSub) {
        this.on('error', (err) => Err(err));
        this.on('callback', (event) => {
          this.diagnosticChannel.emit('callback', event);
        });
        this.on('close', (e) => this.diagnosticChannel.emit('close', e));
        const interval = setInterval(() => {
          this.callsDone = 0;

          if (this.streamQueue.subscribe.length > 0) {
            const streams = this.streamQueue.subscribe;
            const symbol = symbolFromStreams(streams);
            this.wssApi.subscribe([streams], ++this.callId);
            ++this.callsDone;
            this.diagnosticChannel.emit('call', { symbol, method: 'subscribe', id: this.callId });
          }

          if (this.streamQueue.unsubscribe.length > 0) {
            const streams = this.streamQueue.subscribe;
            const symbol = symbolFromStreams(streams);
            this.wssApi.unsubscribe([streams], ++this.callId);
            ++this.callsDone;
            this.diagnosticChannel.emit('call', { symbol, method: 'unsubscribe', id: this.callId });
          }
        }, this.callInterval);

        this.on('close', () => clearInterval(interval));
        setTimeout(() => {
          this.collected = true;
        }, this.initTimeout);
      }
      this.firstSub = false;
    } else if (!this.active) {
      await this.connectApi();
      this.active = true;
    } else {
      const symbol = market.id.toLowerCase();
      if (this.wssApi.markets.has(symbol)) {
        const err = `Already subsribed to ${symbol}`;
        return void this.emit(err);
      }
      this.wssApi.markets.set(symbol, market);
      const stream = symbol + '@aggTrade';
      if (this.callsDone === this.limitCalls) {
        const err = 'Rate limit exceeded 4 ws messages per second';
        this.emit('error', err);
        this.streamQueue.subscribe.push(stream);
        return;
      }
      await this.wssApi.ready();
      this.wssApi.subscribe([stream], ++this.callId);
      ++this.callsDone;
      this.diagnosticChannel.emit('call', { symbol, method: 'subscribe', id: this.callId });
    }
  };

  /** @type {(data: TickerTaskData) => Promise<void>} */
  unsubscribeTrades = async (market) => {
    if (!this.active) {
      const err = 'Cannot unsubscribe before ws connection is established';
      Err(err);
      return void this.emit('error', err);
    }
    const symbol = market.id.toLowerCase();
    if (!this.wssApi.markets.has(symbol)) {
      const err = `Already unsubsribed to ${symbol}`;
      Err(err);
      return void this.emit(err);
    }
    this.wssApi.markets.delete(symbol);
    const stream = symbol + '@aggTrade';
    if (this.callsDone === this.limitCalls) {
      const err = 'Rate limit exceed 4 messages per call per second';
      this.emit('error', err);
      this.streamQueue.unsubscribe.push(stream);
      return;
    }
    this.wssApi.unsubscribe([stream], ++this.callId);
    ++this.callsDone;
    this.diagnosticChannel.emit('call', { symbol, method: 'unsubscribe', id: this.callId });
  };
}

module.exports = { LegacyClient };
