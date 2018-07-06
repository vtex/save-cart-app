import { DEFAULT_LOCALE } from './constants'

/**
 * Executa alguns passos que validam os dados do orderForm
 */
const waitCheckoutValidation = () => {
  const clientProfilePromise = new Promise(resolve =>
    // eslint-disable-next-line
    $('#client-profile-data').one('componentValidated.vtex', resolve)
  )
  const shippingPromise = new Promise(resolve =>
    // eslint-disable-next-line
    $('#shipping-data').one('componentValidated.vtex', resolve)
  )
  const paymentPromise = new Promise(resolve =>
    // eslint-disable-next-line
    $('#payment-data').one('componentValidated.vtex', resolve)
  )
  return Promise.all([clientProfilePromise, shippingPromise, paymentPromise])
}

export function formatPrice(value) {
  return (value / 100).toFixed(2).toString(10)
}

/**
 * Obtém o local de origem do carrinho, ex: pt-BR
 *
 * @param {*} orderForm OrderForm (Contém os dados do carrinho)
 */
export function getLocale(orderForm) {
  const { clientPreferencesData } = orderForm || {}
  return clientPreferencesData && clientPreferencesData.locale
    ? clientPreferencesData.locale.replace('-', '_') : DEFAULT_LOCALE
}

const baseUrl = (account, workspace = 'master') => {
  return `//${workspace}--${account}.myvtex.com/save-cart`
}

/**
 * Gera a URL que obtém um orderForm
 *
 * @param {*} account Account da loja
 * @param {*} workspace Workspace que a app está instalada
 */
export function createUrlOrderForm(account, workspace) {
  return `${baseUrl(account, workspace)}/orderform`
}

/**
 * Obtém o order form, executa os passos de validação e redireciona para a tela de pagamento caso a validação
 * tenha sucesso
 */
export function goToOrderForm() {
  const checkoutValidationPromise = waitCheckoutValidation()
  return Promise.resolve(window.vtexjs.checkout.getOrderForm())
    .then(() => checkoutValidationPromise)
    .then(window.router.orderformRoute)
}

/**
 * Gera um item com os dados do orderForm e produtos do mesmo para ser exibido na lista da APP
 *
 * @param {*} orderForm Dados do orderForm
 * @param {*} name Nome do carrinho
 */
export function createItemListCarts(orderForm, name) {
  const products = orderForm.items.map(item => {
    return {
      uniqueId: item.uniqueId,
      name: item.name,
      imageUrl: item.imageUrl,
      price: `${orderForm.storePreferencesData.currencySymbol} ${formatPrice(item.price)}`,
      quantity: item.quantity,
    }
  })

  return {
    orderFormId: orderForm.orderFormId,
    name: name,
    products: products,
  }
}

/**
 * Obtém o identificador do usuário logado
 *
 * @param {*} orderForm Dados do orderForm
 */
export function getUserProfileId(orderForm) {
  const userProfileId = orderForm.userType && orderForm.userType != null && orderForm.userType.toLowerCase() === 'callcenteroperator' ? orderForm.userType : orderForm.userProfileId
  return userProfileId
}

/**
 * Verifica se o usuário está logado
 *
 * @param {*} orderForm Dados do orderForm
 */
export function userLogged(orderForm) {
  return orderForm != null && orderForm.loggedIn
}
