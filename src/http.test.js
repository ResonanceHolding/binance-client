const { test } = require('node:test');
const assert = require('node:assert');

const { getBinanceSymbolsInfo } = require('./http.js');
const transform = require('./transform.js');

test('getBinanceSymbolsInfo with transform.symbolInfo callback', async () => {
  const symbols = ['BTCUSDT', 'ETHUSDT'];
  const exchange = 'Binance';
  const { symbols: symbolsInfo } = await getBinanceSymbolsInfo(symbols);
  const res = transform.symbolsInfo(exchange, symbolsInfo);
  assert.deepEqual(res, [
    null,
    [
      {
        exchange: 'Binance',
        symbol: 'BTCUSDT',
        base: 'BTC',
        quote: 'USDT',
        minPrice: '0.01000000',
        maxPrice: '1000000.00000000',
      },
      {
        exchange: 'Binance',
        symbol: 'ETHUSDT',
        base: 'ETH',
        quote: 'USDT',
        minPrice: '0.01000000',
        maxPrice: '1000000.00000000',
      },
    ],
  ]);
});
