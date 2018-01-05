import { orderStatus } from '../utils/orderStatus'
import { encryptCard } from '../utils/methods'

/**
 * Função que obtém os dados do pagamento e cria um novo valor com os valores
 * que serão utilizados para a verificação da compra, quando for notificar a masterpass
 * sobre a compra realizada na VTEX
 *
 * @param payment Dados do pagamento
 * @param status Status do pagamento
 * @param currencyCode Código que identifica a moeda
 */
const resolveOrderInfo = (payment, status, currencyCode) => {    
    const authorizationCode = payment.connectorResponses.authId ? payment.connectorResponses.authId : ''
    const totalOrder = payment.value
    const tokenCard = encryptCard(payment.firstDigits, payment.lastDigits)

    const paymentInfo = {
        status: orderStatus[status] || 'Failed',
        currencyCode,
        authorizationCode: authorizationCode,
        total: totalOrder,
        tokenCard: tokenCard
    }

    return paymentInfo
}

/**
 * Função que obtém os dados do pagamento e cria uma lista de novos valores 
 * que serão utilizados para a verificação da compra, quando for notificar a masterpass
 * sobre a compra realizada na VTEX
 * 
 * @param order Pedido
 * @param status Status do pagamento
 * @param currencyCode Código que identifica a moeda
 */
export default async function resolvePaymentInfo(order, status, currencyCode) {    
    const payloads = []
    for (var i in order.payments) {
        var payment = order.payments[i]

        payloads.push(resolveOrderInfo(payment, status, currencyCode))
    }

    return payloads
}
