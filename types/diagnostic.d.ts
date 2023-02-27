export class DiagnosticChannel extends EventEmitter {
    constructor(channel: any, options?: {});
    calls: Map<any, any>;
    expiredCalls: Set<any>;
    channel: any;
    callTimeout: any;
    keepExpiredTimeout: any;
    #private;
}
import { EventEmitter } from "events";
