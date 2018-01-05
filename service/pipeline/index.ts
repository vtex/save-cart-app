import * as compose from 'koa-compose'
import timer from '../utils/timer'

import fillProfileInfo from './steps/fillProfileInfo'
import fillShippingInfo from './steps/fillShippingInfo'
import fillMarketingData from './steps/setMarketingData'
import fillPayment from './steps/fillPayment'
import saveOrderHook from './steps/saveOrderHook'

/**
 * Array com os passos do pipeline a serem executados.
 */
const steps = [
  fillProfileInfo,
  fillShippingInfo,
  fillMarketingData,
  fillPayment,
  saveOrderHook
].map(timer)

/**
 * Inicia o processo de execução dos passos do pipeline
 */
const run = compose(steps)

/**
 * Esse método executa todos os passos do pipeline que atualiza os dados do orderForm
 *
 * @param orderFormId Id do orderForm
 * @param paymentData Dados do pagamento
 * @param ctx Contexto VTEX(account: string, workspace: string, authToken: string)
 * @param logger Logger interno da VTEX
 */
export default function processPaymentProfile(orderFormId: string, paymentData: PaymentData, ctx: ReqContext, logger: any) {
  const state: OperationState = { orderFormId, ctx, data: { paymentData }, logger }
  return run(state)
}
