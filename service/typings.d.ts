declare module "ramda" {
    import X = require('@types/ramda')

    interface Custom {
        call(fn: (...args: any[]) => any, ...args: any[]): any;
        filter<T>(fn: (value: T) => boolean, obj: { [index: string]: T }): { [index: string]: T };
        map<T, U>(fn: (x: T) => U, obj: { [index: string]: T }): { [index: string]: U };
        eqBy<T, U>(fn: (a: T) => U): X.CurriedFunction2<T, T, boolean>;
        eqBy<T, U>(fn: (a: T) => U, a: T, b: T): boolean;
    }

    var R: X.Static & Custom

    export = R
}

interface ReqContext {
    account: string,
    workspace: string,
    authToken: string
}

interface Logger {
    log(content: string, level: LogLevel, details?: {}): PromiseLike<void>
}

interface OperationState {
    orderFormId: string,
    ctx: ReqContext,
    data?: OperationData,
    logger: Logger,
}

interface OperationData {
    orderForm?: any,
    userProfileId: string,
    cookie: string
}

type ProcessPaymentStep = (state: OperationState, next: () => Promise<void>) => Promise<void>

type LogLevel = "info" | "error" | "warning"

type Timings = { [middleware: string]: [number, number] }

declare module "*.json" {
    const value: any
    export default value
}
