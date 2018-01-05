import { prop } from 'ramda'
import getCountryISO2 from '../utils/countryISOMapping'
import getPaymentSystem from '../utils/paymentSystemMapping'

import http from 'axios'

const routes = {
    protocol: (secure) => secure ? 'https' : 'http',
    gateway: (account, secure = false) => `${routes.protocol(secure)}://${account}.vtexpayments.com.br`,
    gatewayApi: account => `${routes.gateway(account)}/api`,
    gatewayPaymentSession: account => `${routes.gatewayApi(account)}/pvt/sessions`,
    gatewayTokenizePayment: (account, sessionId) => `${routes.gatewayApi(account)}/pub/sessions/${sessionId}/tokens`,
    gatewayTransaction: (account, transactionId) => `${routes.gatewayApi(account)}/pvt/transactions/${transactionId}`,
    gatewayCaptures: (account, transactionId) => `${routes.gatewayApi(account)}/pvt/transactions/${transactionId}/settlements`,
    gatewayRefunds: (account, transactionId) => `${routes.gatewayApi(account)}/pvt/transactions/${transactionId}/refunds`,
}

export default ({ account, authToken }: ReqContext) => {
    const headers = {
        Authorization: `bearer ${authToken}`,
        'Content-Type': 'application/json',
        'X-Vtex-Proxy-To': routes.gateway(account, true),
        Accept: 'application/json',
    }

    return {
        /**
         * Cria uma sessão de pagamento no gateway da VTEX
         */
        createSession: (): any => {
            const url = routes.gatewayPaymentSession(account)
            return http.post(url, null, { headers }).then(prop('data'))
        },
        /**
         * Tokeniza os dados de pagamento
         */
        tokenizePayment: (sessionId, payment: Card, receiverName: string): any => {
            const url = routes.gatewayTokenizePayment(account, sessionId)
            const paymentSystem = getPaymentSystem(payment.brandName.toUpperCase())

            const testFields = payment.billingAddress.line5 && payment.billingAddress.line5 != null && payment.billingAddress.line5 != 'null' && payment.billingAddress.line4 && payment.billingAddress.line4 != null && payment.billingAddress.line4 != 'null'
            let street = testFields ? payment.billingAddress.line5 : payment.billingAddress.line1
            street = street.replace('–', '-')
            const number = testFields ? payment.billingAddress.line4 : ''
            const state = payment.billingAddress.subdivision.substring(payment.billingAddress.subdivision.indexOf('-') + 1, payment.billingAddress.subdivision.length)
            
            const addressMapping = ''
            
            const payload = [{
                paymentSystem,
                cardHolder: payment.cardHolderName,
                cardNumber: payment.accountNumber,
                expiryDate: `${payment.expiryMonth}/${payment.expiryYear.toString().slice(-2)}`,
                csc: '',
                document: '',
                documentType: '',
                address: {
                    postalCode: payment.billingAddress.postalCode && payment.billingAddress.postalCode != null && payment.billingAddress.postalCode != 'null' ? payment.billingAddress.postalCode : '',
                    country: getCountryISO2(payment.billingAddress.country),
                    receiverName: receiverName,
                    city: payment.billingAddress.city,
                    state: state,
                    street: street,
                    number: number,
                    complement: payment.billingAddress.line2,
                    neighborhood: payment.billingAddress.line3 && payment.billingAddress.line3 != null && payment.billingAddress.line3 != 'null' ? payment.billingAddress.line3 : '',
                },
            }]            
            return http.post(url, payload, { headers }).then(prop('data'))
        },
        /**
         * Obtém os dados da transação pelo ID
         */
        getTransaction: (transactionId): any => {
            const url = routes.gatewayTransaction(account, transactionId)
            return http.get(url, { headers })
        },
        /**
         * Obtém os dados dos Captures pelo ID da transação
         */
        getCaptures: (transactionId): any => {
            const url = routes.gatewayCaptures(account, transactionId)
            return http.get(url, { headers })
        },
        /**
         * Obtém os dados dos refunds pelo ID da transação
         */
        getRefunds: (transactionId): any => {
            const url = routes.gatewayRefunds(account, transactionId)
            return http.get(url, { headers })
        },
    }
}