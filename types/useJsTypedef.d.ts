/**
 * @typedef {import('./.types').IExample} IExample
 * @typedef {import('./.types').Example} ExampleType
 * @typedef {import('./.types').NumericFunction} NumericFunction
*/
/** @implements {IExample} */
export class JSDocClass implements IExample {
    fs: {};
    /** @param {Buffer} buf */
    write(buf: Buffer): Promise<void>;
}
/** @type {NumericFunction} */
export const jsDocDouble: NumericFunction;
export function jsDocRandom(): ExampleType;
export type IExample = import('./.types').IExample;
export type ExampleType = import('./.types').Example;
export type NumericFunction = import('./.types').NumericFunction;
