import checkoutClient from '../../clients/checkout'

/**
 * Obtém os dados de entrega e atualiza o orderForm
 * 
 * @param state Contém dados de entrega e outros dados necessários para realizar o processamento
 * @param next Próxima função a ser executada
 */
export default async function fillShippingInfo(state: OperationState, next: () => Promise<void>) {
  const { orderFormId, ctx, data: { paymentData: { shippingAddress, personalInfo } } } = state
  const checkout = checkoutClient(ctx)
  let orderForm

  try {
    orderForm = await checkout.updateShipping(orderFormId, shippingAddress, personalInfo.fullName)
  } catch (err) {
    console.log(err)
    throw err
  }  
  state.data.orderForm = orderForm
  await next()
}
