const { EventEmitter } = require('node:events');

const CALL_TIMEOUT = 2000;
const KEEP_EXPIRED = 20000;

class DiagnosticChannel extends EventEmitter {
  constructor(channel, options = {}) {
    super();
    this.calls = new Map();
    this.expiredCalls = new Set();
    this.channel = channel;
    this.callTimeout = options.callTimeout || CALL_TIMEOUT;
    this.keepExpiredTimeout = options.keepExpiredTimeout || KEEP_EXPIRED;
    this.#listen();
  }

  #listen = () => {
    this.on('callback', this.#callback);
    this.on('call', this.#call);
    const interval = setInterval(() => {
      this.expiredCalls.clear();
    }, this.keepExpiredTimeout);
    this.on('close', () => {
      clearInterval(interval);
    });
  };

  #callback = (msg) => {
    if (!this.calls.has(msg.id)) {
      if (this.expiredCalls.has(msg.id)) {
        const err = `Received a callback after call timeout: ${JSON.stringify(msg)}`;
        this.expiredCalls.delete(msg.id);
        return void this.channel.emit('error', err);
      }
      const err = 'Received a callback from an unexpected call: ' + JSON.stringify(msg);
      return void this.channel.emit('error', err);
    }
    const [symbol, method] = this.calls.get(msg.id);
    if (msg.result !== null) {
      const err = `Binance API error symbol: ${symbol}, method: ${method}
      message: ${JSON.stringify(msg)}`;
      this.channel.emit('error', err);
    }
    return void this.calls.delete(msg.id);
  };

  #call = (msg) => {
    const { symbol, method, id } = msg;
    this.calls.set(id, [symbol, method]);
    setTimeout(() => {
      this.calls.delete(id);
    }, this.callTimeout);
  };
}

module.exports = { DiagnosticChannel };
