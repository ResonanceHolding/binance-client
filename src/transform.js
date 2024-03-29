class Trade {
  constructor(props) {
    this.exchange = props.exchange;
    this.quote = props.quote;
    this.base = props.base;
    this.tradeId = props.tradeId;
    this.sequenceId = props.sequenceId || '';
    this.unix = String(props.unix);
    this.side = props.side;
    this.price = props.price;
    this.amount = props.amount;
    this.buyOrderId = props.buyOrderId || '';
    this.sellOrderId = props.sellOrderId || '';

    // attach any extra props
    for (const key in props) {
      if (!this[key]) this[key] = props[key];
    }
  }

  get marketId() {
    return `${this.base}/${this.quote}`;
  }
}

/**
 * Transforms binance AggTrade data to a CCXWS format
 * @param {import('./types').AggTradeResponse} msg
 * @param {import('./types').Market} market
 * @param {string} exchange
 * @returns {import('./types').Trade}
 */
const transformAggTrade = (msg, market, exchange) => {
  const { a: trade_id, p: price, q: size, T: time, m: buyer } = msg.data;
  const unix = time;
  const amount = size;
  const side = buyer ? 'buy' : 'sell';
  return new Trade({
    exchange,
    base: market.base,
    quote: market.quote,
    tradeId: trade_id.toFixed(),
    unix,
    side,
    price,
    amount,
  });
};

/**
 * Transforms binance Raw Trade data to a CCXWS format
 * @param {import('./types').RawTradeResponse} msg
 * @param {import('./types').Market} market
 * @param {string} exchange
 * @returns {import('./types').Trade}
 */
const transformRawTrade = (msg, market, exchange) => {
  const { t: trade_id, p: price, q: size, b: buyOrderId, a: sellOrderId, T: time, m: buyer } = msg.data;
  const unix = time;
  const amount = size;
  const side = buyer ? 'buy' : 'sell';
  return new Trade({
    exchange,
    base: market.base,
    quote: market.quote,
    tradeId: trade_id,
    unix,
    side,
    price,
    amount,
    buyOrderId,
    sellOrderId,
  });
};

class TransfomrError extends Error {
  constructor(message, symbol) {
    super(`${message} in symbol ${symbol}`);
    this.symbol = symbol;
  }
}

const transformOneSymbolInfo = (exchange, symbolInfo) => {
  const { symbol, baseAsset: base, quoteAsset: quote, filters } = symbolInfo;
  const priceInfo = filters.find(({ filterType }) => filterType === 'PRICE_FILTER');
  if (!priceInfo) return [new TransfomrError('No price info', symbol), null];
  const { minPrice, maxPrice } = priceInfo;
  const result = { exchange, symbol, base, quote, minPrice, maxPrice };
  return [null, result];
};

const transfromSymbolsInfo = (exchange, symbolsInfo) => {
  const { errors, results } = symbolsInfo.reduce((acc, symbolInfo) => {
    const [err, res] = transformOneSymbolInfo(exchange, symbolInfo);
    if (err) acc.errors.push(err);
    else acc.results.push(res);
    return acc;
  }, { errors: [], results: [] });
  const err = errors.length === 0 ? null : new AggregateError(errors);
  return [err, results];
};

module.exports = {
  aggTrade: transformAggTrade,
  trade: transformRawTrade,
  symbolsInfo: transfromSymbolsInfo,
};
