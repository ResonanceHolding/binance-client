const timers = require('node:timers/promises');
const { httpUrl } = require('./config.js');

const assignMethodToUrl = (url, method) =>
  `${url}/${method}`;

const assignSymbolsToUrl = (url, symbols) =>
  `${url}?symbols=${JSON.stringify(symbols)}`;

/**
 *
 * @param {string[]} symbols
 */
const getSymbolsInfo = async (symbols) => {
  const reqUrl = assignSymbolsToUrl(assignMethodToUrl(httpUrl, 'exchangeInfo'), symbols);
  const res = await fetch(reqUrl);
  return res.json();
};

class Limiter {
  constructor() {
    this.limit = 50;
    this.timeout = 10 * 1000;
    this.banTimeout = 2 * 60 * 1000;
    this.counter = 0;
    this.ban = false;
  }

  static banError = () => new Error('IP address banned');

  call = async () => {
    if (this.ban) throw Limiter.banError();
    this.counter++;
    if (this.counter > 50) {
      await timers.setTimeout(this.timeout);
      this.counter = 0;
    }
  };

  banned = async () => {
    this.ban = true;
    await timers.setTimeout(this.banTimeout);
    return (this.ban = false);
  };
}

const wrapToErrResult = async (fn, args) => {
  let err = null;
  let res = null;
  try {
    res = await fn(args);
  } catch (error) {
    err = error;
  }
  return { err, res };
};

const createWithRateLimit = (fn) => {
  const limiter = new Limiter();
  return async (args) => {
    await limiter.call();
    const first = await wrapToErrResult(fn, args);
    if (first.err) {
      await limiter.banned();
      const second = await wrapToErrResult(fn, args);
      if (second.err) {
        limiter.ban = true;
        throw Limiter.banError();
      } else {
        return second.res;
      }
    } else {
      return first.res;
    }
  };
};

const getBinanceSymbolsInfo = createWithRateLimit(getSymbolsInfo);

module.exports = {
  assignMethodToUrl,
  assignSymbolsToUrl,
  getSymbolsInfo,
  wrapToErrResult,
  Limiter,
  getBinanceSymbolsInfo,
};
