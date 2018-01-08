import checkoutClient from '../../clients/checkout'
import { lensProp, over, compose, uniq, defaultTo, append } from 'ramda'

const appendUniq = (value) => compose(uniq, append(value), defaultTo([]))

const addMarketingTag = (tag, marketingData) => {
  return {
    attachmentId: 'marketingData',
    ...over(lensProp('marketingTags'), appendUniq(tag), marketingData || {}),
  }
}

/**
 * Obtém os dados de marketing e atualiza o orderForm
 * 
 * @param state Contém os dados de marketing e outros dados necessários para realizar o processamento
 * @param next Próxima função a ser executada
 */
export default async function setMarketingData(state: OperationState, next: () => Promise<void>) {
  const { orderFormId, ctx, data: { cookie } } = state
  const checkout = checkoutClient(ctx)
  const newMarketingData = addMarketingTag('savecart', {})
  let orderForm

  try {
    orderForm = await checkout.saveMarketingData(orderFormId, newMarketingData, cookie)
  } catch (error) {
    throw error
  }

  state.data.orderForm = orderForm
  await next()
}
