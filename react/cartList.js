import axios from 'axios'
import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import PropTypes from 'prop-types'
import Modal from './components/Modal'
import ListCart from './components/ListCart'
import Loading from './components/Loading'
import _ from 'underscore'
import getCarts from './graphql/getCarts.graphql'
import removeCart from './graphql/removeCart.graphql'
import currentTime from './graphql/currentTime.graphql'
import getSetupConfig from './graphql/getSetupConfig.graphql'
import { FormattedMessage, injectIntl, intlShape } from 'react-intl'

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
    let message = error && error.data ? error.data.errorMessage : 'Não foi possível se comunicar com o sistema de Profile.'
    if (error.data && error.data.error && error.data.error.message) {
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
  async useCart(cart) {
    this.activeLoading(true)
    const { orderForm } = this.state

    console.log(orderForm)
    console.log(cart)

    // CLEAR CURRENT CART
    await this.clearCart(orderForm.orderFormId)

    // ADD ITEMS TO CART
    await axios({
      url: `/api/checkout/pub/orderForm/${orderForm.orderFormId}/items/`,
      method: 'post',
      data: {
        'expectedOrderFormSections': ['items'],
        'orderItems': _.map(cart.items, (item) => {
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
      _.each(cart.items, (item, key) => {
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
      console.log(carts)
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
    const { id, cartName } = cart
    console.log('Deleting expired cart: ', cartName)

    this.props.removeCart({ variables: {
      id,
    } }).then((result) => {
      if (result.data.removeCart === true) {
        console.log('Deleted expired cart successfully: ', cartName)
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

    const { getSetupConfig: { getSetupConfig: { adminSetup } } } = this.props
    const { cartLifeSpan } = adminSetup || DEFAULT_ADMIN_SETUP
    const { items, carts, orderForm } = this.state
    const handleRemoveCart = this.removeCart
    const handleUseCart = this.useCart
    const optsListCart = { items, carts, handleRemoveCart, handleUseCart, cartLifeSpan }

    return (
      userLogged(orderForm)
        ? <div>
          <div className={styles.menuTop} onClick={this.handleOpenModal}>
            <FormattedMessage id="quotes" />
          </div>
          <Modal show={this.state.isModalOpen} onClose={this.handleCloseModal}>
            <div className="bg-light-silver bb b--black-20 pa3 br--top modal-top">
              <button onClick={this.handleCloseModal} className="close nt1-m" data-dismiss="modal">&times;</button>
              <h4 className="f6 black-70 mv0 mt0-m ttu b"><FormattedMessage id="quotes" /> <Loading visible={this.state.enabledLoading} /></h4>
            </div>
            <ListCart {...optsListCart} />
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
