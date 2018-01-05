import checkoutClient from '../../clients/checkout'

//Salva o hook e criar o endpoint para realizar o log com a masterpass
export default async function saveOrderHook(state: OperationState, next: () => Promise<void>) {
  const { orderFormId, ctx, data: { paymentData: { transactionId, currencyCode, preCheckoutTransactionId }, tokenCard } } = state
  const { account, workspace } = ctx
  const checkout = checkoutClient(ctx)
  let url: string
  
  if (preCheckoutTransactionId) {
    url = `http://${workspace}--${account}.myvtex.com/masterpassexpress/checkout/postback?transactionId=${transactionId}&currencyCode=${currencyCode}&tokenCard=${tokenCard}&preCheckoutTransactionId=${preCheckoutTransactionId}`
  } else {
    url = `http://${workspace}--${account}.myvtex.com/masterpassexpress/checkout/postback?transactionId=${transactionId}&currencyCode=${currencyCode}&tokenCard=${tokenCard}`
  }

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
