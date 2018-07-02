import qs from 'qs'
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

import {
    createUrlRemoveCart,
    createUrlUseCart,
    createUrlListCarts,
    createUrlOrderForm,
    setCookie,
    getUserProfileId,
    userLogged,
} from './utils'

class MyCarts extends Component {
  static propTypes = {
    getSetupConfig: PropTypes.object,
    saveCartMutation: PropTypes.func,
    getCarts: PropTypes.func,
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

    this.removeItem = this.removeItem.bind(this)
    this.currentCartSaved = this.currentCartSaved.bind(this)
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
   * @param {*} cartLifeSpan Tempo de duração do carrinho
   */
  handleSaveCart(name, cartLifeSpan) {
    this.clearMessages()
    this.activeLoading(true)

    if (name && name.length > 0) {
      const masterDataEntry = {
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
        cartLifeSpan: cartLifeSpan,
      }

      this.props.saveCartMutation({variables: {
        cart: masterDataEntry,
      }}).then(() => {
        this.activeLoading(false)
        this.handleUpdateSuccess('Carrinho salvo com sucesso!')
        this.listCarts()
      }).catch((err) => {
        console.log(err)
        this.activeLoading(false)
      })
    } else {
      this.activeLoading(false)
      this.setState({ messageError: 'Por favor informe o nome do carrinho a ser salvo!' })
    }
  }

  /**
   * Essa função exclui o carrinho selecionado da base de dados da APP
   *
   * @param {*} orderFormId Identificador do orderForm
   */
  removeCart(orderFormId) {
      this.activeLoading(true)
      const { account, workspace } = window.__RUNTIME__
      const { orderForm } = this.state

      const data = {
          userProfileId: getUserProfileId(orderForm),
          orderFormId: orderFormId
      }

      axios.post(createUrlRemoveCart(account, workspace), qs.stringify(data))
          .then(response => {
              this.activeLoading(false)
              this.removeItem(orderFormId)
              this.handleUpdateSuccess('Carrinho removido com sucesso!')
          })
          .catch((error) => {
              this.activeLoading(false)
              this.handleUpdateError(error.response)
          })
  }

  /**
   * Essa função utiliza o orderFormId do carrinho selecionado para ser o carrinho atual
   * do usuário
   *
   * @param {*} orderFormId Identificador do orderForm
   */
  useCart(orderFormId) {
      this.activeLoading(true)
      const { account, workspace } = window.__RUNTIME__
      const { orderForm, items } = this.state
      const data = {
          userProfileId: getUserProfileId(orderForm),
          orderFormId: orderFormId
      }

      axios.post(createUrlUseCart(account, workspace), qs.stringify(data))
          .then(response => {
              setCookie('checkout.vtex.com', '', -1)
              setCookie('checkout.vtex.com', `__ofid=${orderFormId}`, 30, `.${document.domain}`)
              setCookie('checkout.vtex.com', `__ofid=${orderFormId}`, 30, `${document.domain}`)
              location.reload()
          })
          .catch((error) => {
              this.activeLoading(false)
              this.handleUpdateError(error.response)
          })
  }

  /**
   * Essa função obtém a lista de carrinhos que o usuário salvou anteriormente
   */
  listCarts() {
    // const { account, workspace } = window.__RUNTIME__
    // const { orderForm } = this.state
    // const userProfileId = orderForm ? getUserProfileId(orderForm) : ''
    // const vtexIdclientAutCookie = getCookieUser(account)

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
   * Métod auxiliar para remover o carrinho dos items que estão no state
   *
   * @param {*} orderFormId Identificador do orderForm
   */
  removeItem(orderFormId) {
      let items = this.state.items
      const indexItem = items.findIndex(val => val.orderFormId === orderFormId)

      items.splice(indexItem, 1)
      this.setState({ items: items })
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
      window.checkout.loading(true)
      this.listCarts()
      this.setState({ isModalOpen: true, items: [] })
      window.checkout.loading(false)
     // })
          // .catch(error => {
          //     window.checkout.loading(false)
          //     const response = error.response
          //     if (response && response.data && response.data.errorMessage && response.data.errorMessage != "") {
          //         this.handleProfileError(response.data.errorMessage)
          //     } if (response && response.data && response.data.error && response.data.error.message && response.data.error.message != "") {
          //         this.handleProfileError(response.data.error.message)
          //     }
          //     else {
          //         this.handleProfileError(error)
          //     }
          // })
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
  createNewCart() {
    this.activeLoading(true)
    const { account, workspace } = window.__RUNTIME__
    const url = createUrlOrderForm(account, workspace)

    axios.get(url)
      .then(response => {
        const orderForm = response.data
        setCookie('checkout.vtex.com', `__ofid=${orderForm.orderFormId}`, 30, `.${document.domain}`)
        setCookie('checkout.vtex.com', `__ofid=${orderForm.orderFormId}`, 30, `${document.domain}`)
        location.reload()
      })
      .catch(error => {
        this.activeLoading(false)
        this.handleUpdateError(error.response)
      })
  }

  /**
   * Essa função verifica se o carrinho atual está na lista de carrinhos no state
   */
  currentCartSaved() {
      const { orderForm, items } = this.state
      return items.some(val => val.orderFormId === orderForm.orderFormId)
  }

  render() {
    if (this.props.getSetupConfig.loading) {
      return null
    }

    const { items, carts, messageError, messageSuccess, orderForm } = this.state
    const handleRemoveCart = this.removeCart
    const handleUseCart = this.useCart
    const handleCurrentCartSaved = this.currentCartSaved
    const optsListCart = { items, carts, handleRemoveCart, handleUseCart, handleCurrentCartSaved }
    const cartSaved = items.find(val => orderForm != null && val.orderFormId === orderForm.orderFormId)

    return (
      <div>
        <Button classes={'ph3 mb2 white bg-blue fr'} onClick={this.handleOpenModal}>
          {this.props.getSetupConfig.getSetupConfig.adminSetup.cartName || 'Save Cart'}
        </Button>
        <Modal show={this.state.isModalOpen} onClose={this.handleCloseModal}>
          <div className="bg-washed-blue bb b--black-20 pa3 br3 br--top">
            <button onClick={this.handleCloseModal} className="close nt1-m" data-dismiss="modal">&times;</button>
            <h4 className="f6 white mv0 mt0-m ttu">Meus Carrinhos <Loading visible={this.state.enabledLoading} /></h4>
          </div>
          <Tabs messageSuccess={messageSuccess} messageError={messageError} clearMessage={this.clearMessages}>
            <Tab name="Salvar">
              {
                cartSaved
                  ? <div className="w-100 tc pa2 pa3-ns">
                    <p className="f6">O carrinho atual está gravado como <b>"{cartSaved.name}"</b>.</p>
                  </div>
                  : <SaveCart onClick={this.handleSaveCart} cartLifeSpan={this.props.getSetupConfig.getSetupConfig.adminSetup.cartLifeSpan || 7} />
              }
            </Tab>
            <Tab name="Listar">
              <ListCart {...optsListCart} />
            </Tab>
            <Tab name="Novo Carrinho">
              <div className="tc pa2 pa3-ns">
                {
                  cartSaved
                    ? <Button classes={'ph3 mb2 white bg-blue'} onClick={() => this.createNewCart()}>Criar Novo Carrinho</Button>
                    : <div className="overflow-auto">
                      <div className="fl w-100">
                        <p className="f6">O carrinho atual não está salvo, deseja criar um novo mesmo assim?</p>
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
)(MyCarts)
