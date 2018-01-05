import gatewayClient from '../../clients/gateway'
import checkoutClient from '../../clients/checkout'
import { head, reject, propEq, map, evolve } from 'ramda'
import { encryptCard } from '../../utils/methods'

const withMask = {
  cardNumber: () => '***',
  expiryDate: () => '***',
  csc: () => '***',
  document: () => '***',
  documentType: () => '***',
}

const sanitizePrivateData = (err) => {
  const { data } = err.response.config
  const sanitized = map((paymentData) => evolve(withMask, paymentData), JSON.parse(data))
  err.response.config.data = sanitized
  return err
}

/**
 * Realiza um processamento sobre os dados de pagamento, tokeniza eles e atualiza o orderForm com esses valores
 * 
 * @param state Contém dados de pagamento e outros dados necessários para realizar o processamento
 * @param next Próxima função a ser executada 
 */
export default async function fillPayment(state: OperationState, next: () => Promise<void>) {
  const { orderFormId, ctx, data: { paymentData: payment } } = state
  const gateway = gatewayClient(ctx)
  const checkout = checkoutClient(ctx)

  let paymentToken
  try {
    const { id: sessionId } = await gateway.createSession()
    paymentToken = await gateway.tokenizePayment(sessionId, payment.card, payment.personalInfo.fullName).then(head)
  } catch (err) {
    if (err.response) {
      const error = sanitizePrivateData(err)
      throw error
    }
    throw err
  }

  const { paymentData: { availableTokens } } = await checkout.addOrderFormPaymentToken(orderFormId, paymentToken)
  const tokensToRemove = reject(propEq('tokenId', paymentToken.token), availableTokens)

  if (tokensToRemove.length > 0) {
    await Promise.mapSeries(tokensToRemove, ({ tokenId }) => checkout.removeOrderFormPaymentToken(orderFormId, tokenId))
  }

  const orderForm = await checkout.setOrderFormPaymentType(orderFormId, payment.total, [paymentToken])
  const { bin, lastDigits } = paymentToken

  state.data.orderForm = orderForm
  state.data.paymentToken = paymentToken
  state.data.tokenCard = encryptCard(bin, lastDigits)
  await next()
}
