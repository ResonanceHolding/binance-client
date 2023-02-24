/**
 * @typedef {import('./.types').IExample} IExample
 * @typedef {import('./.types').Example} ExampleType
 * @typedef {import('./.types').NumericFunction} NumericFunction
*/

/** @implements {IExample} */
export class JSDocClass {
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

/** @type {NumericFunction} */
export const jsDocDouble = (a) => a * 2;

/** @returns {ExampleType} */
export const jsDocRandom = () => Math.floor(Math.random() * 2) === 1 ? 'type' : 'example';
