import axios from 'axios'
import { DEFAULT_LOCALE } from './constants'
import _ from 'underscore'
import Delete from '@vtex/styleguide/lib/icon/Delete'
import Button from '@vtex/styleguide/lib/Button'
import { FormattedMessage } from 'react-intl'
import React from 'react'
import PropTypes from 'prop-types'

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

export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
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

const formatDate = (date, cartLifeSpan = 0) => {
  const tempDate = new Date(date)
  if (cartLifeSpan > 0) {
    tempDate.setDate(tempDate.getDate() + cartLifeSpan)
  }
  return `${tempDate.getDate()}/${tempDate.getMonth() + 1}/${tempDate.getFullYear()}`
}

export function formatCartList(carts, cartLifeSpan) {
  const formattedCarts = []
  carts.map(cart => {
    const cartQuantity = _.reduce(cart.items, function(memo, item) { return memo + item.quantity }, 0)
    const cartObj = {
      creationDate: formatDate(cart.creationDate),
      expirationDate: formatDate(cart.creationDate, cartLifeSpan),
      cartName: cart.cartName,
      itemQuantity: cartQuantity,
      cartId: cart.id,
      items: cart.items,
    }
    formattedCarts.push(cartObj)
  })
  return formattedCarts
}

export const itemSchema = ({ openUseModal, openRemoveModal }) => {
  const rowAction = ({ rowData: { items, cartName, cartId } }) => {
    return (
      <div>
        <Button variation="primary" size="small" onClick={() => openUseModal({ useData: items, cartName })}>
          <FormattedMessage id="cart.use.button" />
        </Button>
        <Button variation="tertiary" size="small" onClick={() => openRemoveModal({ removeData: cartId, cartName })}>
          <Delete size={15} />
        </Button>
      </div>
    )
  }
  rowAction.propTypes = {
    rowData: PropTypes.func,
  }
  return {
    properties: {
      creationDate: {
        type: 'string',
        title: <FormattedMessage id="list.quote.date" />,
      },
      expirationDate: {
        type: 'string',
        title: <FormattedMessage id="list.quote.expire" />,
      },
      cartName: {
        type: 'string',
        title: <FormattedMessage id="modal.name" />,
        width: 35,
      },
      itemQuantity: {
        type: 'number',
        title: <FormattedMessage id="list.items" />,
        width: 15,
      },
      color: {
        type: 'object',
        title: '',
        cellRenderer: rowAction,
        width: 20,
      },
    },
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

export async function saveMarketingData(orderFormId) {
  let result = false
  await axios({
    url: `/api/checkout/pub/orderForm/${orderFormId}/attachments/marketingData`,
    method: 'post',
    data: {
      'expectedOrderFormSections': ['items'],
      'attachmentId': 'marketingData',
      'marketingTags': ['vtex.savecart']
    },
    headers: defaultHeaders,
  }).then(response => {
    result = true
  }).catch((error) => {
    result = false
  })

  return result
}
