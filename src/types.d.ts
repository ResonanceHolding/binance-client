export type Symbol = string;
export type StreamType = 'aggTrade' | 'trade';
export type BinanceStream = Symbol | StreamType;

export type CcxwsRequiredEvents = 'trade' | 'error';

export type Market = {
  id: string;
  base: string;
  quote: string;
  type?: string;
};

// TickerTask | Market {
//   key: 'ALGO/BUSD',
//   data: TickerTaskData { 
//    id: 'ALGOBUSD',
//    base: 'ALGO',
//    quote: 'BUSD',
//   }
// }

export type TickerTaskData = {
  id: string;
  base: string;
  quote: string;
};

export type TickerTask = { key: string; data: TickerTaskData };

// Trade {
//   exchange: 'Binance',
//   quote: 'BUSD',
//   base: 'ACH',
//   tradeId: '3516888',
//   sequenceId: undefined,
//   unix: 1677232478612,
//   side: 'buy',
//   price: '0.04120000',
//   amount: '1008.00000000',
//   buyOrderId: undefined,
//   sellOrderId: undefined,
// }

export type Trade = {
  exchange: string;
  quote: string;
  base: string;
  tradeId: string;
  sequenceId?: string;
  unix: number;
  side: string;
  price: string;
  amount: string;
  buyOrderId?: string;
  sellOrderId?: string;
};

export type TradeHandler = (trade: Trade) => void;
export type ErrorHandler = (err: Error) => void;

export interface CcxwsClient {
  on(event: CcxwsRequiredEvents, hanlder: TradeHandler | ErrorHandler): void;
  subscribeTrades(data: TickerTaskData): Promise<void>;
  unsubscribeTrades(data: TickerTaskData): Promise<void>;
}

/**
 * Binance API requrements and limitations
 *
 *  - WebSocket connections have a limit of 5 incoming messages per second. A message is considered:
 *      - A PING frame
 *      - A PONG frame
 *      - A JSON controlled message (e.g. subscribe, unsubscribe)
 *  - A connection that goes beyond the limit will be disconnected;
 *    IPs that are repeatedly disconnected may be banned.
 *  - A single connection can listen to a maximum of 1024 streams.
 *  - There is a limit of 300 connections per attempt every 5 minutes per IP.
 */

// {"method":"SUBSCRIBE","params":["algobtc@aggTrade"],"id":35}

// {
//   response: {
//     stream: 'achbusd@aggTrade',
//     data:             {
//      "e": "aggTrade",		# event type
//      "E": 1499405254326,	# event time
//      "s": "ETHBTC",			# symbol
//      "a": 70232,			  	# aggregated tradeid
//      "p": "0.10281118",	# price
//      "q": "8.15632997",	# quantity
//      "f": 77489,				  # first breakdown trade id
//      "l": 77489,				  # last breakdown trade id
//      "T": 1499405254324,	# trade time
//      "m": false,				  # whether buyer is a maker
//      "M": true				    # can be ignored
//   }
// }
export type AggTradeData = {
  e: string;
  E: number;
  s: string;
  a: number;
  p: string;
  q: string;
  f: number;
  l: number;
  T: number;
  m: boolean;
  M: boolean;
};
export type AggTradeResponse = {
  stream: string;
  data: AggTradeData;
};

// {
//   market: { id: 'AAVEUSDT', base: 'AAVE', quote: 'USDT' },
//   trade: Trade {
//     exchange: 'Binance',
//     quote: 'USDT',
//     base: 'AAVE',
//     tradeId: '78083569',
//     sequenceId: undefined,
//     unix: 1677235582304,
//     side: 'buy',
//     price: '85.50000000',
//     amount: '1.10800000',
//     buyOrderId: undefined,
//     sellOrderId: undefined
//   }
// }

// stream: symbol
// data: {
//   "e": "trade",     # Event type
//   "E": 123456789,   # Event time
//   "s": "BNBBTC",    # Symbol
//   "t": 12345,       # Trade ID
//   "p": "0.001",     # Price
//   "q": "100",       # Quantity
//   "b": 88,          # Buyer order Id
//   "a": 50,          # Seller order Id
//   "T": 123456785,   # Trade time
//   "m": true,        # Is the buyer the market maker?
//   "M": true         # Ignore.
// }
export type RawTradeData = {
  e: string;
  E: number;
  s: string;
  t: number;
  p: string;
  q: string;
  b: number;
  a: number;
  T: number;
  m: boolean;
  M: boolean;
};
export type RawTradeResponse = {
  stream: string;
  data: RawTradeData;
};

export type CallbackResponse = {
  id: number;
  result: null;
};
