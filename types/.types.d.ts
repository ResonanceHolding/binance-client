declare const _default: {};
export default _default;
/**
 * Interfaces declared as type. Use capital "I" for interface and type distinction
 */
export type IExample = {
    write: (buf: Buffer) => Promise<void>;
};
/**
 * Type example
 */
export type Example = 'example' | 'type';
export type NumericFunction = (a: number) => number;
