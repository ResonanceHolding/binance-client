// JS-Doc @implements -> for classes
export interface DtsExampleInterfaceWriter {
  write(buf: Buffer): Promise<void> 
}

// JS-Doc @typedef to import, @type to use
export type DtsExampleType = 'example' | 'type';

// Function can not be defined as type!!!
// const with arrow sytax not working as well!!!
// Fucntion declaration
export function dtsExampleFunction(...args: number[]): number
