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

/**
 * Gera a URL que obtém o nome do botão da APP
 * 
 * @param {*} account Account da loja
 * @param {*} workspace Workspace que a app está instalada
 */
export function createUrlNameApp(account, workspace) {
  return `${baseUrl(account, workspace)}/name`
}

/**
 * Gera a URL que salva o carrinho
 * 
 * @param {*} account Account da loja
 * @param {*} workspace Workspace que a app está instalada
 */
export function createUrlSaveCart(account, workspace) {
  return `${baseUrl(account, workspace)}/save`
}

/**
 * Gera a URL que deleta o carrinho
 * 
 * @param {*} account Account da loja
 * @param {*} workspace Workspace que a app está instalada
 */
export function createUrlRemoveCart(account, workspace) {
  return `${baseUrl(account, workspace)}/remove`
}

/**
 * Gera a URL que usa o carrinho
 * 
 * @param {*} account Account da loja
 * @param {*} workspace Workspace que a app está instalada
 */
export function createUrlUseCart(account, workspace) {
  return `${baseUrl(account, workspace)}/use`
}

/**
 * Gera a URL que lista os carrinhos salvos
 * 
 * @param {*} account Account da loja
 * @param {*} workspace Workspace que a app está instalada
 */
export function createUrlListCarts(account, workspace) {
  return `${baseUrl(account, workspace)}/list`
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
 * Obtém o nome do botão da APP
 */
export function getNameApp() {
  const { account, workspace } = window.__RUNTIME__
  return axios.get(createUrlNameApp(account, workspace))
    .then(response => response.data)
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
      quantity: item.quantity
    }
  })

  return {
    orderFormId: orderForm.orderFormId,
    name: name,
    products: products
  }
}

/**
 * Extrai o cookie do navegador
 * 
 * @param {*} name Nome do cookie 
 */
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

/**
 * Cria um cookie
 * 
 * @param {*} name Nome do cookie
 * @param {*} value Valor
 * @param {*} days Dias de validade
 * @param {*} domain Domínio
 */
export function setCookie(name, value, days, domain) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${value}${expires}; domain=${domain}; path=/`
}

export function getCookieUser(account){
  let cookie = `VtexIdclientAutCookie_${account}=${getCookie(`VtexIdclientAutCookie_${account}`)}`

  if(cookie && cookie != null && cookie != ''){
    return cookie
  }

  let cookie = `VtexIdclientAutCookie=${getCookie(`VtexIdclientAutCookie`)}`
  return cookie
}

/**
 * Obtém o identificador do usuário logado
 * 
 * @param {*} orderForm Dados do orderForm 
 */
export function getUserProfileId(orderForm) {
  const userProfileId = orderForm.userType && orderForm.userType === 'callcenteroperator' ? orderForm.userType : orderForm.userProfileId
  return userProfileId
}

/**
 * Verifica se o usuário está logado
 * 
 * @param {*} orderForm Dados do orderForm 
 */
export function userLogged(orderForm) {
  return orderForm != null && (orderForm.loggedIn && orderForm.userProfileId != null || (orderForm.userType && orderForm.userType === 'callcenteroperator'))  
}
