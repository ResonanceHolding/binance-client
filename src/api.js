const WebSocket = require('ws');
const { Err, Debug } = require('logger');

const WS_STREAM_URL_PREFIX = '/stream?streams=';

/** @type {(streams: string[]) => string} */
const combineStreamsForUrl = (streams) =>
  WS_STREAM_URL_PREFIX + streams.join('/');

/** @type {(baseUrl: string, streams?: string[]) => string} */
const createWssUrl = (baseUrl, streams) =>
  !streams ? baseUrl : baseUrl + combineStreamsForUrl(streams);

const ALLOWED_STREAM_TYPES = ['aggTrade', 'trade'];
/** @type {(streamType: string) => boolean} */
const knownStream = (streamType) => ALLOWED_STREAM_TYPES.includes(streamType);

class WssApiSocket {
  constructor(url, channel) {
    this.channel = channel;
    this.socket = new WebSocket(url, {
      perMessageDeflate: false,
    });
    this.socket.on('message', this.onmessage);
  }

  /** @param {string} raw */
  onmessage = (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (error) {
      Err('JSON parsing error: ' + error);
    }
    if (msg.result === null && msg.id) return void this.channel.emit('callback', msg);
    if (msg.error) return void Err('Binance WS API Error: ' + msg.error);
    if (!msg.stream) return void Debug('Unwanted Binance API message: ' + msg);
    const [_lowerCaseSymbol, streamType] = msg.stream.split('@');
    if (!knownStream(streamType)) return void Debug('Data from unwanted stream received: ' + msg);
    return void this.channel.emit(streamType, msg);
  };

  /** @type {(lowerCaseStreams: string[], callId: number) => void} */
  subscribe = (lowerCaseStreams, callId) =>
    this.socket.send(JSON.stringify({
      method: 'SUBSCRIBE',
      params: lowerCaseStreams,
      id: callId,
    }));

  /** @type {(lowerCaseStreams: string[], callId: number) => void} */
  unsubscribe = (lowerCaseStreams, callId) =>
    this.socket.send(JSON.stringify({
      method: 'UNSUBSCRIBE',
      params: lowerCaseStreams,
      id: callId,
    }));
}

module.exports = { WssApiSocket, createWssUrl };
