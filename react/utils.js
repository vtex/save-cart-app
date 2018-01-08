import axios from 'axios'
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
 * Esse método deixa os valores obtido do orderform de forma mais reduzida e simples.
 * 
 * @param {*} totalizers Valores de produtos, taxas e etc do orderForm
 */
export function createFriendlyTotalizers(totalizers) {
  if (totalizers && totalizers != null)
    return totalizers.reduce((acc, t) => {
      const key = t.id.toLowerCase()
      const value = Math.abs(t.value)
      acc[key] = value
      return acc
    }, {})

  return []
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

export function createUrlNameApp(account, workspace) {
  return `${baseUrl(account, workspace)}/name`
}

export function createUrlSaveCart(account, workspace) {
  return `${baseUrl(account, workspace)}/save`
}

export function createUrlRemoveCart(account, workspace) {
  return `${baseUrl(account, workspace)}/remove`
}

export function createUrlUseCart(account, workspace) {
  return `${baseUrl(account, workspace)}/use`
}

export function createUrlListCarts(account, workspace) {
  return `${baseUrl(account, workspace)}/list`
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

export function getCardsList(account, workspace, userProfileId) {
  return axios.get(`${createUrlListCarts(account, workspace)}?userProfileId=${userProfileId}`)
}

export function getNameApp() {
  const { account, workspace } = window.__RUNTIME__
  return axios.get(createUrlNameApp(account, workspace))
    .then(response => response.data)
}

export function createItemListCarts(orderForm, name) {
  const products = orderForm.items.map(item => {
    return {
      uniqueId: item.uniqueId,
      name: item.name,
      imageUrl: item.imageUrl,
      price: `${orderForm.storePreferencesData.currencySymbol} ${formatPrice(item.price)}`,
      quantity: item.quantity
    }
  })

  return {
    orderFormId: orderForm.orderFormId,
    name: name,
    products: products
  }
}

export function getCookie(name) {
  var cookies = document.cookie
  var prefix = name + "="
  var begin = cookies.indexOf("; " + prefix)
  if (begin == -1) {
    begin = cookies.indexOf(prefix)
    if (begin != 0) {
      return null
    }
  } else {
    begin += 2
  }
  var end = cookies.indexOf(";", begin)
  if (end == -1) {
    end = cookies.length;
  }
  return unescape(cookies.substring(begin + prefix.length, end))
}

export function setCookie(name, value, days) {
  var expires = "";
  if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}