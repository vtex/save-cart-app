import checkoutClient from '../../clients/checkout'

export default async function getOrderForm(state: OperationState, next: () => Promise<void>) {
    const { orderFormId, ctx, data: { cookie } } = state

    const checkout = checkoutClient(ctx)
    let orderForm

    try {
        orderForm = await checkout.getOrderForm(orderFormId, cookie)
    } catch (error) {
        throw error
    }
    console.log('order form que veio', orderForm)
    state.data.orderForm = orderForm
    await next()
}