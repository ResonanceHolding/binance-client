/**
 * No file extensions!!!
 * @typedef {import('./dtsTypes').DtsExampleInterfaceWriter} IDts
 * @typedef {import('./dtsTypes').DtsExampleType} DtsType
 * @typedef {import('./dtsTypes').dtsExampleFunction} dtsFn
*/

/** @implements {IDts} */
export class DtsClass {
  fs = {};
  constructor() {
    this.fs.createStream = (args) => args;
  }

  /** @param {Buffer} buf */
  write(buf) {
    this.fs.createStream(buf);
    return Promise.resolve();
  }
}

/** @type {dtsFn} */
export const dtsSum = (a, b) => a + b;

/** @returns {DtsType} */
export const dtsRandom = () => Math.floor(Math.random() * 2) === 1 ? 'type' : 'example';
