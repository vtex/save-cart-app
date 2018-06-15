import qs from 'qs'
import axios from 'axios'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Modal from './components/Modal'
import ListCart from './components/ListCart'
import Loading from './components/Loading'
import Tabs from './components/Tabs'
import Tab from './components/Tab'
import Button from './components/Button'
import SaveCart from './components/SaveCart'
import {
    createUrlSaveCart,
    createUrlRemoveCart,
    createUrlUseCart,
    createUrlListCarts,
    createUrlOrderForm,
    getNameApp,
    createItemListCarts,
    setCookie,
    getUserProfileId,
    userLogged,
    getCookieUser
} from './utils'

class MyCarts extends Component {
    constructor(props) {
        super(props)
        this.state = {
            buttonName: 'Salvar Carrinho',
            orderForm: null,
            isModalOpen: false,
            items: [],
            messageError: '',
            messageSuccess: '',
            enabledLoading: false
        }

        this.listenOrderFormUpdated = this.listenOrderFormUpdated.bind(this)

        this.handleUpdateError = this.handleUpdateError.bind(this)
        this.handleUpdateSuccess = this.handleUpdateSuccess.bind(this)
        this.clearMessages = this.clearMessages.bind(this)

        this.activeLoading = this.activeLoading.bind(this)

        this.saveCart = this.saveCart.bind(this)
        this.removeCart = this.removeCart.bind(this)
        this.useCart = this.useCart.bind(this)
        this.listCarts = this.listCarts.bind(this)

        this.openModal = this.openModal.bind(this)
        this.closeModal = this.closeModal.bind(this)

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
        // Promise.resolve(window.vtexjs.checkout.getOrderForm())
        //     .then(orderForm => this.setState({ orderForm }))
        //     .then(this.listenOrderFormUpdated)
    }

    /**
     * Essa função obtém o nome do botão antes do componente ser renderizado
     */
    componentWillMount() {
        Promise.resolve(getNameApp())
            .then(nameApp => {
                console.log(nameApp)
                this.setState({ buttonName: nameApp })
            })
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
    saveCart(name) {
        this.clearMessages()
        this.activeLoading(true)

        if (name && name.length > 0) {
            const { account, workspace } = window.__RUNTIME__
            const { orderForm } = this.state
            const vtexIdclientAutCookie = getCookieUser(account)
            const data = {
                userProfileId: getUserProfileId(orderForm),
                orderFormId: orderForm.orderFormId,
                name: name,
                vtexIdclientAutCookie: vtexIdclientAutCookie
            }

            axios.post(createUrlSaveCart(account, workspace), qs.stringify(data))
                .then(response => {
                    let items = this.state.items
                    const item = createItemListCarts(orderForm, name)
                    items.push(item)
                    this.setState({ items: items })
                    this.activeLoading(false)
                    this.handleUpdateSuccess('Carrinho salvo com sucesso!')
                })
                .catch((error) => {
                    this.activeLoading(false)
                    this.handleUpdateError(error.response)
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
        const { account, workspace } = window.__RUNTIME__
        const { orderForm } = this.state
        const userProfileId = orderForm ? getUserProfileId(orderForm) : ''
        const vtexIdclientAutCookie = getCookieUser(account)
        const data = {
            userProfileId: userProfileId,
            vtexIdclientAutCookie: vtexIdclientAutCookie
        }

        return axios.post(`${createUrlListCarts(account, workspace)}`, data)
            .then(response => response.data)
            .catch(error => { throw error })
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
    openModal() {
        const { orderForm } = this.state
        if (userLogged(orderForm)) {
            window.checkout.loading(true)
            Promise.resolve(this.listCarts())
                .then(response => {
                    if (response.messages && response.messages.length > 0) {
                        this.setState({ error: response.messages })
                    }

                    this.setState({ isModalOpen: true, items: response.listCarts })
                    window.checkout.loading(false)
                })
                .catch(error => {
                    window.checkout.loading(false)
                    const response = error.response
                    if (response && response.data && response.data.errorMessage && response.data.errorMessage != "") {
                        this.handleProfileError(response.data.errorMessage)
                    } if (response && response.data && response.data.error && response.data.error.message && response.data.error.message != "") {
                        this.handleProfileError(response.data.error.message)
                    }
                    else {
                        this.handleProfileError(error)
                    }
                })
        } else {
            Promise.resolve(window.vtexid.start())
        }
    }

    /**
     * Essa função fecha o modal
     */
    closeModal() {
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

        return (<div><h2>hahahahahaha</h2></div>)

        const { buttonName, items, messageError, messageSuccess, orderForm } = this.state
        const handleRemoveCart = this.removeCart
        const handleUseCart = this.useCart
        const handleCurrentCartSaved = this.currentCartSaved
        const optsListCart = { items, handleRemoveCart, handleUseCart, handleCurrentCartSaved }

        const cartSaved = items.find(val => orderForm != null && val.orderFormId === orderForm.orderFormId)

        return (
            <div>
                <Button classes={"ph3 mb2 white bg-blue fr"} onClick={this.openModal}>
                    {buttonName}
                </Button>
                <Modal show={this.state.isModalOpen} onClose={this.closeModal}>
                    <div className="bg-washed-blue bb b--black-20 pa3 br3 br--top">
                        <button onClick={this.closeModal} className="close nt1-m" data-dismiss="modal">&times;</button>
                        <h4 className="f6 white mv0 mt0-m ttu">Meus Carrinhos <Loading visible={this.state.enabledLoading} /></h4>
                    </div>
                    <Tabs messageSuccess={messageSuccess} messageError={messageError} clearMessage={this.clearMessages}>
                        <Tab name="Salvar">
                            {
                                cartSaved ?
                                    <div className="w-100 tc pa2 pa3-ns">
                                        <p className="f6">O carrinho atual está gravado como <b>"{cartSaved.name}"</b>.</p>
                                    </div>
                                    : <SaveCart onClick={this.saveCart} />
                            }
                        </Tab>
                        <Tab name="Listar">
                            <ListCart {...optsListCart} />
                        </Tab>
                        <Tab name="Novo Carrinho">
                            <div className="tc pa2 pa3-ns">
                                {
                                    cartSaved ?
                                        <Button classes={"ph3 mb2 white bg-blue"} onClick={() => this.createNewCart()}>Criar Novo Carrinho</Button>
                                        :
                                        <div className="overflow-auto">
                                            <div className="fl w-100">
                                                <p className="f6">O carrinho atual não está salvo, deseja criar um novo mesmo assim?</p>
                                            </div>
                                            <Button classes={"ph3 mb2 white bg-blue"} onClick={() => this.createNewCart()}>Sim</Button>
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

export default MyCarts