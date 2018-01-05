import checkoutClient from '../../clients/checkout'

/**
 * 
 * @param state 
 * @param next 
 */
export default async function saveOrderHook(state: OperationState, next: () => Promise<void>) {
  const { orderFormId, ctx, data: { userProfileId } } = state
  const { account, workspace } = ctx
  const checkout = checkoutClient(ctx)
  const url = `http://${workspace}--${account}.myvtex.com/save-cart/postback?userProfileId=${userProfileId}&orderFormId=${orderFormId}`
  const hook = {
    major: '0',
    url: url,
  }
  try {
    await checkout.updateOrderHook(orderFormId, hook)
  } catch (err) {
    throw err
  }

  await next()
}
