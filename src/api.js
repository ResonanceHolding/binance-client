/**
 * @typedef {import('./types').TickerTaskData} Market
 * @typedef {import('node:events').EventEmitter} Channel
 */

const WebSocket = require('ws');

const transform = require('./transform.js');

const STREAM_PFX = '/stream';
const MULTI_STREAM_PFX = '?streams=';

/** @type {(streams: string[]) => string} */
const combineStreamsForUrl = (streams) =>
  MULTI_STREAM_PFX + streams.join('/');

/** @type {(baseUrl: string, streams?: string[]) => string} */
const createWssUrl = (baseUrl, streams) =>
  !streams ? baseUrl + STREAM_PFX : baseUrl + STREAM_PFX + combineStreamsForUrl(streams);

const ALLOWED_STREAM_TYPES = ['aggTrade', 'trade'];
/** @type {(streamType: string) => boolean} */
const knownStream = (streamType) => ALLOWED_STREAM_TYPES.includes(streamType);

/**
 * @param {Market[]} markets
 * @param {string[]} streamTypes
 * @returns {[Map<string, Market>, string[]]}
 */
const prepareMarketsAndStreams = (markets, streamTypes) => {
  const streams = [];
  /** @type {[string, Market][]} */
  const entries = markets.map((market) => {
    const symbol = market.id.toLowerCase();
    streamTypes.forEach((type) =>
      streams.push(`${symbol}@${type}`));
    return [symbol, market];
  });
  const mrkts = new Map(entries);
  return [mrkts, streams];
};

class BinanceWssApi {
  // State of ws connection
  connected = false;
  // State of API client for reconnect case
  active = false;
  // place holder for web socket
  #socket;
  exchange = 'Binance';
  reconnectAttempts = 4;
  reconnectTimeout = 0;
  reconnectsDone = 0;

  /**
   * Binance Wss API - responsible for binance WSS API
   * @param {string | URL} baseUrl
   * @param {Pick<Channel, 'emit'>} channel
   * @param {Market[]} markets
   * @param {string[]} streamTypes
   */
  constructor(baseUrl, channel, markets, streamTypes = ['aggTrade']) {
    this.channel = channel;
    const [mrkts, streams] = prepareMarketsAndStreams(markets, streamTypes);
    this.markets = mrkts;
    this.wssUrl = createWssUrl(baseUrl.toString(), streams);
    this.open();
  }

  /**
   * open - open wss api connection
   */
  open = () => {
    this.active = true;
    this.#socket = new WebSocket(this.wssUrl, { perMessageDeflate: false });
    this.connected = true;
    this.#socket.on('message', this.#onmessage);
    this.#socket.on('error', this.#onerror);
    this.#socket.on('close', this.#onclose);
  };

  /**
   * close - close wss api connection
   */
  close = () => {
    this.active = false;
    this.#socket.close();
    this.connected = false;
    this.channel.emit('close', null);
  };

  /**
   * ready - wait until websocket connection is ready
   * @returns {Promise<void>}
   */
  ready = () => new Promise((resolve) => {
    if (this.#socket.readyState === WebSocket.OPEN) resolve();
    else this.#socket.on('open', () => resolve());
  });

  /**
   * onerror - ws error event handler
   * closed on error
   * @param {Error} error
   */
  #onerror = (error) => {
    const err = 'WS Connection error: ' + error.message;
    this.channel.emit('error', err);
    this.close();
  };

  /**
   * onclose - ws close event handler
   */
  #onclose = () => {
    this.connected = false;
    if (!this.active) return;
    if (this.reconnectsDone < this.reconnectAttempts) {
      this.#reconnect();
    } else {
      const err = 'Reconnected 4 times next attempt can lead to ban';
      this.channel.emit('error', err);
    }
  };

  #reconnect = () => {
    ++this.reconnectsDone;
    setTimeout(() => {
      this.open();
    }, this.reconnectTimeout);
  };

  /**
   * onmessage - binance wss 'message' event handler
   * @type {(raw: string) => void}
   */
  #onmessage = (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (error) {
      const err = 'JSON parsing error: ' + error;
      return void this.channel.emit('error', err);
    }
    // Callback - result from a subsribe or unsubscribe command
    if (msg.result === null && msg.id) return void this.channel.emit('callback', msg);
    // Binance api error
    if (msg.error) {
      if (msg.id) this.channel.emit('callback', msg);
      const err = 'Binance WS API Error: ' + JSON.stringify(msg);
      return void this.channel.emit('error', err);
    }
    // not a stream message - unwanted message
    if (!msg.stream) {
      const warn = 'Unwanted Binance WS API message: ' + JSON.stringify(msg);
      return void this.channel.emit('error', warn);
    }
    /** @type {string[]} */
    const [lowerCaseSymbol, streamType] = msg.stream.split('@');
    // data from stream we were not subscribed
    if (!knownStream(streamType)) {
      const warn = 'Data from unwanted stream received: ' + JSON.stringify(msg);
      return void this.channel.emit('error', warn);
    }
    const market = this.markets.get(lowerCaseSymbol);
    const trade = transform[streamType](msg, market, this.exchange);
    return void this.channel.emit('trade', trade);
  };

  /**
   * sucbscribe - accepts an array of binance streams in lower case
   * and id which binance use to identify request via websocket
   * result:
   *    side effect, subscribes to streams
   *    then socket will start receiving messages from binance streams
   * example args: (lowerCaseStreams: ['achbusd@aggTrade', 'achbusd@trade'], id: 10)
   * @type {(lowerCaseStreams: string[], id: number) => void}
   */
  subscribe = (lowerCaseStreams, id) =>
    this.#socket.send(JSON.stringify({
      method: 'SUBSCRIBE',
      params: lowerCaseStreams,
      id,
    }));

  /**
   * unsucbscribe - accepts an array of binance streams in lower case
   * and id which binance use to identify request via websocket
   * result: side effect, unsubscribes from streams
   * example args: (lowerCaseStreams: ['achbusd@aggTrade', 'achbusd@trade'], id: 10)
   * @type {(lowerCaseStreams: string[], id: number) => void}
   */
  unsubscribe = (lowerCaseStreams, id) =>
    this.#socket.send(JSON.stringify({
      method: 'UNSUBSCRIBE',
      params: lowerCaseStreams,
      id,
    }));
}

module.exports = { BinanceWssApi, createWssUrl };
