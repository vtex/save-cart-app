import axios from 'axios'
import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import PropTypes from 'prop-types'
import Modal from './components/Modal'
import ListCart from './components/ListCart'
import Loading from './components/Loading'
import Tabs from './components/Tabs'
import Tab from './components/Tab'
import Button from './components/Button'
import SaveCart from './components/SaveCart'
import getSetupConfig from './graphql/getSetupConfig.graphql'
import _ from 'underscore'
import saveCartMutation from './graphql/saveCart.graphql'
import getCarts from './graphql/getCarts.graphql'
import removeCart from './graphql/removeCart.graphql'

import {
    userLogged,
} from './utils'

class MyCarts extends Component {
  static propTypes = {
    getSetupConfig: PropTypes.object,
    saveCartMutation: PropTypes.func,
    getCarts: PropTypes.func,
    removeCart: PropTypes.func,
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

    this.handleSaveCart = this.handleSaveCart.bind(this)
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
      text: `Não foi possível se comunicar com o sistema de Profile. <br/>${error}`,
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
   * Essa função salva o carrinho atual so usuário
   *
   * @param {*} name Nome do carrinho
   */
  handleSaveCart(name) {
    this.clearMessages()
    this.activeLoading(true)

    if ((name && name.length > 0) && (this.state.orderForm.items && this.state.orderForm.items.length)) {
      const cart = {
        email: this.state.orderForm.clientProfileData.email,
        cartName: name,
        items: _.map(this.state.orderForm.items, function(item) {
          return {
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
      }

      this.props.saveCartMutation({variables: {
        cart: cart,
      }}).then((result) => {
        if (result.data.saveCart) {
          cart.id = result.data.saveCart.substr(5)
          var carts = this.state.carts.slice(0)
          carts.push(cart)
          this.setState({
            carts: carts,
          })
          this.activeLoading(false)
          this.handleUpdateSuccess('Cotação salva com sucesso!')
        } else {
          this.setState({ messageError: 'Erro ao tentar salvar cotação!' })
          this.activeLoading(false)
        }
      }).catch((err) => {
        console.log(err)
        this.activeLoading(false)
      })
    } else {
      this.activeLoading(false)
      this.setState({ messageError: 'Por favor informe o nome da cotação a ser salva!' })
    }
  }

  /**
   * Essa função exclui o carrinho selecionado da base de dados da APP
   *
   * @param {*} id Identificador do orderForm
   */
  removeCart(id) {
    this.activeLoading(true)
    this.props.removeCart({variables: {
      id: id,
    }}).then((result) => {
      if (result.data.removeCart === true) {
        var carts = this.state.carts.slice(0)
        carts = _.filter(carts, (cart) => {
          return cart.id !== id
        })
        this.setState({
          carts: carts,
        })
        this.activeLoading(false)
        this.handleUpdateSuccess('Cotação removida com sucesso!')
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
    if (orderForm.userType !== null) {
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

    this.activeLoading(false)
    location.reload()
    return true
  }

  /**
   * Essa função obtém a lista de carrinhos que o usuário salvou anteriormente
   */
  listCarts() {
    this.activeLoading(true)
    this.props.getCarts({variables: {
      email: this.state.orderForm.clientProfileData.email,
    }}).then((result) => {
      console.log(result)
      this.setState({
        carts: result.data.getCarts,
      })
      this.activeLoading(false)
    }).catch((err) => {
      console.log(err)
      this.activeLoading(false)
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
      this.setState({ isModalOpen: true })
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

  /**
   * Essa função cria um novo orderForm em branco
   */
  async createNewCart() {
    const { orderForm } = this.state
    this.activeLoading(true)
    await this.clearCart(orderForm.orderFormId)
    this.activeLoading(false)
    location.reload()
    return true
  }

  render() {
    if (this.props.getSetupConfig.loading) {
      return null
    }

    const { items, carts, messageError, messageSuccess } = this.state
    const handleRemoveCart = this.removeCart
    const handleUseCart = this.useCart
    const optsListCart = { items, carts, handleRemoveCart, handleUseCart }

    return (
      <div>
        <Button classes={'ph3 mb2 white bg-blue fr'} onClick={this.handleOpenModal}>
          {this.props.getSetupConfig.getSetupConfig.adminSetup.cartName || 'Save Cart'}
        </Button>
        <Modal show={this.state.isModalOpen} onClose={this.handleCloseModal}>
          <div className="bg-washed-blue bb b--black-20 pa3 br3 br--top">
            <button onClick={this.handleCloseModal} className="close nt1-m" data-dismiss="modal">&times;</button>
            <h4 className="f6 white mv0 mt0-m ttu">Cotações <Loading visible={this.state.enabledLoading} /></h4>
          </div>
          <Tabs messageSuccess={messageSuccess} messageError={messageError} clearMessage={this.clearMessages}>
            <Tab name="Salvar Cotação Atual">
              {
                <SaveCart onClick={this.handleSaveCart} />
              }
            </Tab>
            <Tab name="Listar Cotações">
              <ListCart {...optsListCart} />
            </Tab>
            <Tab name="Novo Carrinho">
              <div className="tc pa2 pa3-ns">
                {
                  <div className="overflow-auto">
                    <div className="fl w-100">
                      <p className="f6">O carrinho será esvaziado, deseja criar mesmo assim?</p>
                    </div>
                    <Button classes={'ph3 mb2 white bg-blue'} onClick={() => this.createNewCart()}>Sim</Button>
                  </div>
                }
              </div>
            </Tab>
          </Tabs>
        </Modal>
      </div>
    )
  }
}

export default compose(
  graphql(getSetupConfig, { name: 'getSetupConfig', options: { ssr: true } }),
  graphql(saveCartMutation, { name: 'saveCartMutation', options: { ssr: false } }),
  graphql(getCarts, { name: 'getCarts', options: { ssr: false } }),
  graphql(removeCart, { name: 'removeCart', options: { ssr: false } }),
)(MyCarts)
