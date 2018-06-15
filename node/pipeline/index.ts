import * as compose from 'koa-compose'
import timer from '../utils/timer'

import fillMarketingData from './steps/setMarketingData'
import saveOrderHook from './steps/saveOrderHook'

/**
 * Array com os passos do pipeline a serem executados.
 */
const steps = [
  fillMarketingData,
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
export default function processPaymentProfile(orderFormId: string, ctx: ReqContext, data: OperationData, logger: any) {
  const state: OperationState = { orderFormId, ctx, data, logger }
  return run(state)
}
