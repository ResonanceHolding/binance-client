export function assignMethodToUrl(url: any, method: any): string;
export function assignSymbolsToUrl(url: any, symbols: any): string;
/**
 *
 * @param {string[]} symbols
 */
export function getSymbolsInfo(symbols: string[]): Promise<any>;
export function wrapToErrResult(fn: any, args: any): Promise<{
    err: unknown;
    res: any;
}>;
export class Limiter {
    static banError: () => Error;
    limit: number;
    timeout: number;
    banTimeout: number;
    counter: number;
    ban: boolean;
    call: () => Promise<void>;
    banned: () => Promise<boolean>;
}
export function getBinanceSymbolsInfo(args: any): Promise<any>;
