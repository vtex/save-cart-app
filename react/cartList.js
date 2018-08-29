import axios from 'axios'
import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import { FormattedMessage, injectIntl, intlShape } from 'react-intl'
import PropTypes from 'prop-types'
import { path } from 'ramda'
import _ from 'underscore'

import ListCart from './components/ListCart'
import MessageDisplay from './components/MessageDisplay'
import getCarts from './graphql/getCarts.graphql'
import removeCart from './graphql/removeCart.graphql'
import currentTime from './graphql/currentTime.graphql'
import getSetupConfig from './graphql/getSetupConfig.graphql'

import Modal from '@vtex/styleguide/lib/Modal'
import Spinner from '@vtex/styleguide/lib/Spinner'
import Tabs from '@vtex/styleguide/lib/Tabs'
import Tab from '@vtex/styleguide/lib/Tabs/Tab'

import './global.css'
import styles from './style.css'

import {
  userLogged,
  saveMarketingData,
} from './utils'

const DEFAULT_ADMIN_SETUP = {
  cartName: 'Save Cart',
  cartLifeSpan: 7,
}

class CartList extends Component {
  static propTypes = {
    getSetupConfig: PropTypes.object,
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
    }

    this.listenOrderFormUpdated = this.listenOrderFormUpdated.bind(this)

    this.handleUpdateError = this.handleUpdateError.bind(this)
    this.handleUpdateSuccess = this.handleUpdateSuccess.bind(this)
    this.clearMessages = this.clearMessages.bind(this)

    this.activeLoading = this.activeLoading.bind(this)

    this.removeCart = this.removeCart.bind(this)
    this.useCart = this.useCart.bind(this)
    this.listCarts = this.listCarts.bind(this)

    this.handleOpenModal = this.handleOpenModal.bind(this)
    this.handleCloseModal = this.handleCloseModal.bind(this)
  }

  /**
   * Essa função é chamado quando o componente é renderizado
   *
   * 1º - Obtém o orderForm e atualiza o state com esse valor mais a url do carrinho (callbackUrl)
   * 2º - Adiciona um evento que toda vez que o orderForm for atualizado eu atualizo o valor no state
   */
  componentDidMount() {
    console.log('MOUNTED SAVECART APP')

    if (window.vtexjs) {
      Promise.resolve(window.vtexjs.checkout.getOrderForm())
        .then(orderForm => this.setState({ orderForm }))
        .then(this.listenOrderFormUpdated)
    }
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
   * Essa função exclui o carrinho selecionado da base de dados da APP
   *
   * @param {*} id Identificador do orderForm
   */
  removeCart(id) {
    this.activeLoading(true)
    this.props.removeCart({ variables: {
      id: id,
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
      this.handleUpdateError(err.response)
    })
  }

  async clearCart(orderFormId) {
    await axios({
      url: `/api/checkout/pub/orderForm/${orderFormId}/items/removeAll`,
      method: 'post',
      data: {
        'expectedOrderFormSections': ['items'],
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }).then(response => {
      console.log(response)
    }).catch((error) => {
      this.activeLoading(false)
      this.handleUpdateError(error.response)
    })
    return true
  }

  /**
   * Essa função utiliza o orderFormId do carrinho selecionado para ser o carrinho atual
   * do usuário
   *
   * @param {*} orderFormId Identificador do orderForm
   */
  async useCart(items) {
    this.activeLoading(true)
    const { orderForm } = this.state

    // CLEAR CURRENT CART
    await this.clearCart(orderForm.orderFormId)

    // ADD ITEMS TO CART
    await axios({
      url: `/api/checkout/pub/orderForm/${orderForm.orderFormId}/items/`,
      method: 'post',
      data: {
        'expectedOrderFormSections': ['items'],
        'orderItems': _.map(items, (item) => {
          return {
            id: item.id,
            quantity: item.quantity,
            seller: '1',
          }
        }),
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })
      .then(response => {
        console.log(response)
      })
      .catch((error) => {
        this.activeLoading(false)
        this.handleUpdateError(error.response)
      })

    // SE FOR TELEVENDAS
    if (orderForm.userType === 'callCenterOperator') {
      const priceRequests = []
      _.each(items, (item, key) => {
        priceRequests.push(axios({
          url: `/api/checkout/pub/orderForm/${orderForm.orderFormId}/items/${key}/price`,
          method: 'put',
          data: {
            'price': item.sellingPrice,
          },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }))
      })
      await axios.all(priceRequests).then((result) => {
        console.log(result)
      }).catch((err) => {
        console.log(err)
      })
    }

    await saveMarketingData(orderForm.orderFormId)

    this.activeLoading(false)
    window.location.href = '/checkout/'
    return true
  }

  /**
   * Essa função obtém a lista de carrinhos que o usuário salvou anteriormente
   */
  listCarts() {
    const { currentTime: { currentTime }, getSetupConfig: { getSetupConfig: { adminSetup } } } = this.props
    const { cartLifeSpan } = adminSetup || DEFAULT_ADMIN_SETUP
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
        promises.push(this.removeFromDB(cart))
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
    })
  }

  removeFromDB(cart) {
    const { id } = cart

    this.props.removeCart({ variables: {
      id,
    } }).then((result) => {
      if (result.data.removeCart === true) {
        cart.id = null
      } else {
        this.handleUpdateError()
      }
    }).catch((err) => {
      console.log('Error deleting cart', err)
      this.handleUpdateError(err.response)
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
    this.listCarts()
    this.setState({ isModalOpen: true })
  }

  /**
   * Essa função fecha o modal
   */
  handleCloseModal() {
    this.clearMessages()
    this.setState({ isModalOpen: false })
  }

  render() {
    if (this.props.getSetupConfig.loading) {
      return null
    }
    const intl = this.props.intl
    const { getSetupConfig: { getSetupConfig: { adminSetup } } } = this.props
    const { cartLifeSpan } = adminSetup || DEFAULT_ADMIN_SETUP
    const { items, carts, orderForm, messageError, messageSuccess, enabledLoading } = this.state
    const handleRemoveCart = this.removeCart
    const handleUseCart = this.useCart
    const optsListCart = { items, carts, handleRemoveCart, handleUseCart, cartLifeSpan, enabledLoading }

    return (
      userLogged(orderForm)
        ? <div className="onda-v1">
          <div className={styles.menuTop} onClick={this.handleOpenModal}>
            <FormattedMessage id="quotes" />
          </div>
          <Modal isOpen={this.state.isModalOpen} onClose={this.handleCloseModal} >
            <div className="onda-v1">
              <div style={{ width: '800px' }}></div>
              <div className="bb b--black-20 ph2 pv3 mb3">
                <div className="dib black-70 ttu b f4">
                  <FormattedMessage id="quotes" />
                  {enabledLoading && <span className="dib ml4">  <Spinner size={17} /></span>}
                </div>
              </div>
              <MessageDisplay messageSuccess={messageSuccess} messageError={messageError} clearMessage={this.clearMessages} />
              <Tabs>
                <Tab label={intl.formatMessage({ id: 'modal.tab.list' })} active={this.state.currentTab === 1} onClick={() => {}}>
                  <ListCart {...optsListCart} />
                </Tab>
              </Tabs>
            </div>
          </Modal>
        </div>
        : null
    )
  }
}

export default injectIntl(compose(
  graphql(getSetupConfig, { name: 'getSetupConfig', options: { ssr: false } }),
  graphql(getCarts, { name: 'getCarts', options: { ssr: false } }),
  graphql(removeCart, { name: 'removeCart', options: { ssr: false } }),
  graphql(currentTime, { name: 'currentTime' }),
)(CartList))
