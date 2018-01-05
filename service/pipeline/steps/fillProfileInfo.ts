import checkoutClient from '../../clients/checkout'

/**
 * Obtém os dados do usuário e atualiza o orderForm
 * 
 * @param state Contém dados do usuário e outros dados necessários para realizar o processamento
 * @param next Próxima função a ser executada
 */
export default async function fillProfileInfo(state: OperationState, next: () => Promise<void>) {
  const { orderFormId, ctx, data: { paymentData: { personalInfo } } } = state
  const checkout = checkoutClient(ctx)
  let orderForm

  try {
    await checkout.setIgnoreProfile(orderFormId, true)
  } catch (err) {
    if (!err.response || err.response.status !== 403) {
      throw err
    }
  }

  try {
    orderForm = await checkout.updateOrderFormProfile(orderFormId, personalInfo)
    if (!orderForm.clientProfileData.firstName) {
      orderForm = await checkout.updateOrderFormProfile(orderFormId, personalInfo)
    }
  } catch (err) {
    throw err
  }

  state.data.orderForm = orderForm
  await next()
}
