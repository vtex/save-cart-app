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

interface MerchantInfo {
    primaryProductionMode: string,
    primaryCheckoutId: string,
    primaryConsumerKey: string,
    primaryPrivateKey: string,
    primaryCompanyLegalName: string,
    primaryDoingBusAs: string,
    primaryWebsiteURL: string,
    primaryCountryCode: string,
    primaryPhoneNumber: string,
    primaryEmail: string,
    primaryCity: string,
    primaryCountry: string,
    primaryAddressLine1: string,
    primaryPostalCode: string
}

interface PaymentData {
    card: Card,
    transactionId: string,
    personalInfo: PersonalInfo,
    shippingAddress: Address,
    walletId: string,
    currencyCode: string,
    total: number,
    preCheckoutTransactionId?: string
}

interface PersonalInfo {
    fullName: string,
    nationalId: string,
    recipientPhone: string,
    recipientEmailAddress?: string
}

interface Card {
    brandId: string,
    brandName: string,
    accountNumber: string,
    cardHolderName: string,
    expiryMonth: string,
    expiryYear: string,
    billingAddress: Address,
    lastFour?: string
}

interface Address {
    city: string,
    country: string,
    subdivision: string,
    line1: string,
    line2: string,
    line3?: string,
    line4?: string,
    line5?: string,
    postalCode: string
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
    response?: [PaymentTokenResponse],
    logger: Logger,
}

interface PaymentTokenResponse {
    token: string,
    bin: string,
    lastDigits: string,
    paymentSystem: string,
    paymentSystemName: string
}

interface OperationData {
    orderForm?: any,
    paymentData?: PaymentData,
    paymentToken?: string,
    tokenCard?: string
}

interface SessionResponse {
    createPaymentSession: {
        id: string
    }
}

interface TokenizeResponse {
    createPaymentTokens: PaymentTokenResponse[]
}

type ProcessPaymentStep = (state: OperationState, next: () => Promise<void>) => Promise<void>

type LogLevel = "info" | "error" | "warning"

type Timings = { [middleware: string]: [number, number] }

declare module "*.json" {
    const value: any
    export default value
}
