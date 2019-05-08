import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import { FormattedMessage, injectIntl, intlShape } from 'react-intl'
import PropTypes from 'prop-types'
import { path, pick } from 'ramda'
import _ from 'underscore'

import ListCart from './components/ListCart'
import SaveCart from './components/SaveCart'
import MessageDisplay from './components/MessageDisplay'
import Print from './print'
import saveCartMutation from './graphql/saveCart.graphql'
import getCarts from './graphql/getCarts.graphql'
import removeCart from './graphql/removeCart.graphql'
import currentTime from './graphql/currentTime.graphql'
import getSetupConfig from './graphql/getSetupConfig.graphql'
import useCartMutation from './graphql/useCartMutation.graphql'
import getRepresentative from './graphql/getRepresentative.graphql'

import Button from '@vtex/styleguide/lib/Button'
import Modal from '@vtex/styleguide/lib/Modal'
import Spinner from '@vtex/styleguide/lib/Spinner'
import Tabs from '@vtex/styleguide/lib/Tabs'
import Tab from '@vtex/styleguide/lib/Tabs/Tab'

import './global.css'

import {
  userLogged,
  saveMarketingData,
} from './utils'

const DEFAULT_ADMIN_SETUP = {
  cartName: 'Save Cart',
  cartLifeSpan: 7,
  storeLogoUrl: '',
}

class MyCarts extends Component {
  static propTypes = {
    getSetupConfig: PropTypes.object,
    getRepresentative: PropTypes.object,
    saveCartMutation: PropTypes.func,
    useCartMutation: PropTypes.func,
    getCarts: PropTypes.func,
    removeCart: PropTypes.func,
    intl: intlShape,
    currentTime: PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.state = {
      orderForm: null,
      isModalOpen: false,
      items: [],
      carts: [],
      messageError: '',
      messageSuccess: '',
      enabledLoading: false,
      currentTab: 1,
      cartToPrint: '',
    }

    this.listenOrderFormUpdated = this.listenOrderFormUpdated.bind(this)

    this.handleUpdateError = this.handleUpdateError.bind(this)
    this.handleUpdateSuccess = this.handleUpdateSuccess.bind(this)
    this.clearMessages = this.clearMessages.bind(this)

    this.activeLoading = this.activeLoading.bind(this)

    this.handleSaveCart = this.handleSaveCart.bind(this)
    this.removeCart = this.removeCart.bind(this)
    this.useCart = this.useCart.bind(this)
    this.listCarts = this.listCarts.bind(this)
    this.printCart = this.printCart.bind(this)
    this.finishedPrinting = this.finishedPrinting.bind(this)

    this.handleOpenModal = this.handleOpenModal.bind(this)
    this.handleCloseModal = this.handleCloseModal.bind(this)
    this.handleTabChange = this.handleTabChange.bind(this)
  }

  /**
   * Essa função é chamado quando o componente é renderizado
   *
   * 1º - Obtém o orderForm e atualiza o state com esse valor mais a url do carrinho (callbackUrl)
   * 2º - Adiciona um evento que toda vez que o orderForm for atualizado eu atualizo o valor no state
   */
  componentDidMount() {
    Promise.resolve(window.vtexjs.checkout.getOrderForm())
      .then(orderForm => this.setState({ orderForm }))
      .then(this.listenOrderFormUpdated)
  }

  /**
   * Adiciona um evento para quando o orderForm for atualizado ele atualiza o orderForm no state
   */
  listenOrderFormUpdated() {
    // eslint-disable-next-line
    $(window).on('orderFormUpdated.vtex', (_, orderForm) =>
      this.setState({ orderForm })
    )
  }

  /**
   * Essa função exibe o modal padrão da VTEX com o erro
   *
   * @param {*} error Error
   */
  handleProfileError(error) {
    window.vtex.checkout.MessageUtils.showMessage({
      status: 'fatal',
      text: `${this.props.intl.formatMessage({ id: 'generic.error' })} ${error}`,
    })
  }

  /**
   * Essa função extrai a mensagem de erro do objeto error e atualiza o state
   *
   * @param {*} error Error
   */
  handleUpdateError(error) {
    if (error.message) {
      return this.setState({ messageError: error.message })
    }
    let message = error && error.data ? error.data.errorMessage : this.props.intl.formatMessage({ id: 'generic.error' })
    const hasErrorMessage = path(['data', 'error', 'message'])
    if (hasErrorMessage(error)) {
      message = error.data.error.message
    }
    this.setState({ messageError: message })
  }

  /**
   * Essa função obtém a mensagem de sucesso e atualiza o state
   *
   * @param {*} message Mensagem de sucesso
   */
  handleUpdateSuccess(message) {
    this.setState({ messageSuccess: message })
  }

  /**
   * Essa função limpa as mensagens de erro e sucesso do state
   */
  clearMessages() {
    this.setState({ messageError: '', messageSuccess: '' })
  }

  /**
   * Essa função habilita ou desabilita o loading
   *
   * @param {*} active Se está ativo sim ou não
   */
  activeLoading(active) {
    this.setState({ enabledLoading: active })
  }

  /**
   * Essa função salva o carrinho atual so usuário
   *
   * @param {*} name Nome do carrinho
   */
  handleSaveCart(name) {
    this.clearMessages()
    this.activeLoading(true)

    if ((name && name.length > 0) && (this.state.orderForm.items && this.state.orderForm.items.length)) {
      const { totalizers, value, customData: { customApps }, shippingData: { address: { city, complement, country, neighborhood, number, postalCode, state, street } } } = this.state.orderForm
      const subtotal = (totalizers.find(x => x.id === 'Items') || { value: 0 }).value
      const discounts = (totalizers.find(x => x.id === 'Discounts') || { value: 0 }).value
      const shipping = (totalizers.find(x => x.id === 'Shipping') || { value: 0 }).value
      const paymentTerm = customApps[0].fields.PaymentTermDescription
      const address = {
        city,
        complement,
        country,
        neighborhood,
        number,
        postalCode,
        state,
        street,
      }
      const cart = {
        email: this.state.orderForm.clientProfileData.email,
        cartName: name,
        items: _.map(this.state.orderForm.items, function(item) {
          return {
            name: item.name,
            skuName: item.skuName,
            id: item.id,
            productId: item.productId,
            imageUrl: item.imageUrl,
            listPrice: item.listPrice,
            price: item.price,
            quantity: item.quantity,
            sellingPrice: item.sellingPrice,
          }
        }),
        creationDate: new Date().toISOString(),
        subtotal,
        discounts,
        shipping,
        total: value,
        paymentTerm,
        address,
      }

      this.props.saveCartMutation({ variables: {
        cart: cart,
      } }).then((result) => {
        if (result.data.saveCart) {
          cart.id = result.data.saveCart.substr(5)
          var carts = this.state.carts.slice(0)
          carts.push(cart)
          this.setState({
            carts: carts,
          })
          this.activeLoading(false)
          const { getSetupConfig: { getSetupConfig: { adminSetup } } } = this.props
          const { cartLifeSpan } = adminSetup || DEFAULT_ADMIN_SETUP
          const isPlural = cartLifeSpan < 2 ? '' : 's'
          this.handleUpdateSuccess(this.props.intl.formatMessage({ id: 'cart.saved.success' }, { days: cartLifeSpan, isPlural }))
        } else {
          this.setState({ messageError: this.props.intl.formatMessage({ id: 'cart.saved.error' }) })
          this.activeLoading(false)
        }
      }).catch((err) => {
        console.log(err)
        this.activeLoading(false)
      })
    } else {
      this.activeLoading(false)
      this.setState({ messageError: this.props.intl.formatMessage({ id: 'cart.saved.noname' }),
      })
    }
  }

  /**
   * Essa função exclui o carrinho selecionado da base de dados da APP
   *
   * @param {*} id Identificador do orderForm
   */
  removeCart(id, cartName) {
    this.activeLoading(true)
    this.props.removeCart({ variables: {
      id,
      cartName,
      expired: false,
    } }).then((result) => {
      if (result.data.removeCart === true) {
        var carts = this.state.carts.slice(0)
        carts = _.filter(carts, (cart) => {
          return cart.id !== id
        })
        this.setState({
          carts: carts,
        })
        this.activeLoading(false)
        this.handleUpdateSuccess(this.props.intl.formatMessage({ id: 'cart.delete.success' }))
      } else {
        this.activeLoading(false)
        this.handleUpdateError()
      }
    }).catch((err) => {
      console.log(err)
      this.activeLoading(false)
      this.handleUpdateError(err)
    })
  }

  /**
   * Essa função utiliza o orderFormId do carrinho selecionado para ser o carrinho atual
   * do usuário
   *
   * @param {*} orderFormId Identificador do orderForm
   */
  async useCart(items) {
    items = items.map(item => pick(['id', 'quantity', 'sellingPrice'], item)) // Remove unused properties
    this.activeLoading(true)
    const { orderForm } = this.state

    await this.props.useCartMutation({ variables: {
      orderFormId: orderForm.orderFormId,
      items: items,
      userType: orderForm.userType,
    } }).catch((err) => {
      this.activeLoading(false)
      this.handleUpdateError(err)
    })

    await saveMarketingData(orderForm)

    this.activeLoading(false)
    location.reload()
    return true
  }

  printCart(cartId) {
    const cartToPrint = _.find(this.state.carts, (obj) => { return obj.id === cartId })
    this.setState({ cartToPrint })
  }

  finishedPrinting() {
    this.setState({ cartToPrint: '' })
  }

  /**
   * Essa função obtém a lista de carrinhos que o usuário salvou anteriormente
   */
  listCarts() {
    const { currentTime: { currentTime }, getSetupConfig: { getSetupConfig: { adminSetup } } } = this.props
    const { cartLifeSpan, cartName } = adminSetup || DEFAULT_ADMIN_SETUP
    const today = new Date(currentTime)
    this.activeLoading(true)
    const shouldDelete = []
    this.props.getCarts({ variables: {
      email: this.state.orderForm.clientProfileData.email,
    } }).then(async (result) => {
      let carts = result.data.getCarts
      carts.map(cart => {
        const tempDate = new Date(cart.creationDate)
        tempDate.setDate(tempDate.getDate() + cartLifeSpan)
        if (today.getTime() > tempDate.getTime()) {
          shouldDelete.push(cart)
        }
      })

      const promises = []
      shouldDelete.map(cart => {
        promises.push(this.removeFromDB(cart, cartName))
      })
      await Promise.all(promises)

      carts = _.difference(carts, shouldDelete)
      this.setState({
        carts: carts,
      })
      this.activeLoading(false)
    }).catch((err) => {
      console.log(err)
      this.activeLoading(false)
      this.handleUpdateError(err)
    })
  }

  removeFromDB(cart, cartName) {
    const { id } = cart

    this.props.removeCart({ variables: {
      id,
      cartName,
      expired: true,
    } }).then((result) => {
      if (result.data.removeCart === true) {
        cart.id = null
      } else {
        this.handleUpdateError()
      }
    }).catch((err) => {
      console.log('Error deleting cart', err)
    })
  }

  /**
   * Essa função abre o modal verificando alguns passos
   *
   * 1º - Verifica se o usuário está logado
   *  - Se o usuário não estiver logado ele chama a função da vtex que realiza o login
   *  - Se o usuário estiver logado é chamada a função que obtém a lista de carrinhos do usuário
   *    e depois o modal é aberto
   */
  handleOpenModal() {
    const { orderForm } = this.state
    if (userLogged(orderForm)) {
      this.listCarts()
      this.setState({
        isModalOpen: true,
        currentTab: 1,
      })
      window.checkout.loading(false)
    } else {
      Promise.resolve(window.vtexid.start())
    }
  }

  /**
   * Essa função fecha o modal
   */
  handleCloseModal() {
    this.clearMessages()
    this.setState({ isModalOpen: false })
  }

  handleTabChange(tabIndex) {
    this.setState({
      currentTab: tabIndex,
    })
  }

  render() {
    if (this.props.getSetupConfig.loading || !this.props.getSetupConfig.getSetupConfig || !this.state.orderForm) {
      return null
    }
    const intl = this.props.intl
    const { getSetupConfig: { getSetupConfig: { adminSetup } }, getRepresentative: { getRepresentative: representative } } = this.props
    const { cartName, cartLifeSpan, storeLogoUrl } = adminSetup || DEFAULT_ADMIN_SETUP
    const { items, carts, messageError, messageSuccess, enabledLoading, cartToPrint } = this.state
    const handleRemoveCart = this.removeCart
    const handleUseCart = this.useCart
    const handlePrintCart = this.printCart
    const finishedPrinting = this.finishedPrinting
    const { storePreferencesData, clientProfileData, value: total, totalizers } = this.state.orderForm
    const optsListCart = { items, carts, handleRemoveCart, handleUseCart, cartLifeSpan, enabledLoading, handlePrintCart }
    const optsPrintCart = { cartToPrint, cartLifeSpan, finishedPrinting, storePreferencesData, storeLogoUrl, clientProfileData, total, totalizers, representative }

    return (
      <div className="onda-v1">
        <div className="fr">
          <Button id="vtex-cart-list-open-modal-button" variation="tertiary" onClick={this.handleOpenModal}>
            {cartName}
          </Button>
        </div>
        <Modal isOpen={this.state.isModalOpen} onClose={this.handleCloseModal} >
          <div className="onda-v1">
            <div style={{ width: '1000px' }}></div> {/* minimum modal width */}
            <div className="bb b--black-20 ph2 pv3 mb3">
              <div className="dib black-70 ttu b f4">
                <FormattedMessage id="quotes" />
                {enabledLoading && <span className="dib ml4">  <Spinner size={17} /></span>}
              </div>
            </div>
            <MessageDisplay messageSuccess={messageSuccess} messageError={messageError} clearMessage={this.clearMessages} />
            {!!cartToPrint && <Print {...optsPrintCart} />}
            <Tabs>
              <Tab label={intl.formatMessage({ id: 'modal.tab.save' })} active={this.state.currentTab === 1} onClick={() => this.handleTabChange(1)}>
                {
                  <SaveCart onClick={this.handleSaveCart} />
                }
              </Tab>
              <Tab label={intl.formatMessage({ id: 'modal.tab.list' })} active={this.state.currentTab === 2} onClick={() => this.handleTabChange(2)}>
                <ListCart {...optsListCart} />
              </Tab>
            </Tabs>
          </div>
        </Modal>
      </div>
    )
  }
}

export default injectIntl(compose(
  graphql(getSetupConfig, { name: 'getSetupConfig', options: { ssr: false } }),
  graphql(saveCartMutation, { name: 'saveCartMutation', options: { ssr: false } }),
  graphql(getCarts, { name: 'getCarts', options: { ssr: false } }),
  graphql(removeCart, { name: 'removeCart', options: { ssr: false } }),
  graphql(currentTime, { name: 'currentTime', options: { ssr: false } }),
  graphql(useCartMutation, { name: 'useCartMutation', options: { ssr: false } }),
  graphql(getRepresentative, { name: 'getRepresentative', options: { ssr: false } })
)(MyCarts))
