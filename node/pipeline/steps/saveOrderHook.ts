import checkoutClient from '../../clients/checkout'

/**
 * Salva dados no hook para a APP
 * 
 * @param state Contém os dados de marketing e outros dados necessários para realizar o processamento
 * @param next Próxima função a ser executada
 */
export default async function saveOrderHook(state: OperationState, next: () => Promise<void>) {
  const { orderFormId, ctx, data: { userProfileId, cookie } } = state
  const { account, workspace } = ctx
  const checkout = checkoutClient(ctx)
  const url = `http://${workspace}--${account}.myvtex.com/save-cart/postback?userProfileId=${userProfileId}&orderFormId=${orderFormId}`
  const hook = {
    major: '0',
    url: url,
  }
  try {
    await checkout.updateOrderHook(orderFormId, hook, cookie)
  } catch (err) {
    throw err
  }

  await next()
}
