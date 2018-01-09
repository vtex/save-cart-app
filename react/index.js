import qs from 'qs'
import axios from 'axios'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Modal from './components/Modal'
import ListCart from './components/ListCart'
import {
    createUrlSaveCart,
    createUrlRemoveCart,
    createUrlUseCart,
    createUrlListCarts,
    getNameApp,
    createItemListCarts,
    getCookie,
    setCookie,
    axiosConfig
} from './utils'

class SaveCart extends Component {
    constructor(props) {
        super(props)
        this.state = {
            buttonName: 'Salvar Carrinho',
            orderForm: null,
            isModalOpen: false,
            items: [],
            nameCart: '',
            error: '',
            messageSuccess: ''
        }

        this.listenOrderFormUpdated = this.listenOrderFormUpdated.bind(this)
        this.handleUpdateError = this.handleUpdateError.bind(this)
        this.handleUpdateSuccess = this.handleUpdateSuccess.bind(this)
        this.clearMessages = this.clearMessages.bind(this)
        this.openMyCarts = this.openMyCarts.bind(this)
        this.saveCart = this.saveCart.bind(this)
        this.removeCart = this.removeCart.bind(this)
        this.useCart = this.useCart.bind(this)
        this.verifyCart = this.verifyCart.bind(this)
        this.listCarts = this.listCarts.bind(this)
        this.openModal = this.openModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.updateNameCart = this.updateNameCart.bind(this)
        this.removeItem = this.removeItem.bind(this)
    }

    /**
     * Esse método é chamado quando o componente é rederizado
     *
     * 1º - Obtém o orderForm e atualiza o state com esse valor mais a url do carrinho (callbackUrl)
     * 2º - Adiciona um evento que toda vez que o orderForm for atualizado eu atualizo o valor no state
     */
    componentDidMount() {
        Promise.resolve(window.vtexjs.checkout.getOrderForm())
            .then(orderForm => this.setState({ orderForm }))
            .then(this.listenOrderFormUpdated)
    }

    componentWillMount() {
        Promise.resolve(getNameApp())
            .then(nameApp => this.setState({ buttonName: nameApp }))
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

    handleProfileError(error) {
        window.vtex.checkout.MessageUtils.showMessage({
            status: 'fatal',
            text: `Não foi possível se comunicar com o sistema de Profile. <br/>${error}`,
        })
    }

    handleUpdateError(error) {
        let message = error && error.data ? error.data.errorMessage : 'Não foi possível se comunicar com o sistema de Profile.'
        if (error.data && error.data.error && error.data.error.message) {
            message = error.data.error.message
        }
        this.setState({ error: message })
    }

    handleUpdateSuccess(message) {
        this.setState({ messageSuccess: message })
    }

    clearMessages() {
        this.setState({ error: '', messageSuccess: '' })
    }

    openMyCarts() {
        const { orderForm } = this.state
        if (orderForm != null && (orderForm.loggedIn && orderForm.userProfileId != null || (orderForm.userType && orderForm.userType === 'callcenteroperator'))) {
            return true
        }
        return false
    }

    getUserProfileId(orderForm) {
        const userProfileId = orderForm.userType && orderForm.userType === 'callcenteroperator' ? orderForm.userType : orderForm.userProfileId

        return userProfileId
    }

    saveCart(name) {
        this.clearMessages()
        const { account, workspace } = window.__RUNTIME__
        const { orderForm } = this.state
        const data = {
            userProfileId: this.getUserProfileId(orderForm),
            orderFormId: orderForm.orderFormId,
            name: name
        }

        axios.post(createUrlSaveCart(account, workspace), qs.stringify(data))
            .then(response => {
                let items = this.state.items
                const item = createItemListCarts(orderForm, name)
                items.push(item)
                this.setState({ items: items, nameCart: '' })
                this.handleUpdateSuccess('Carrinho salvo com sucesso!')
            })
            .catch((error) => {
                this.handleUpdateError(error.response)
            })
    }

    removeCart(orderFormId) {
        event.preventDefault()
        const { account, workspace } = window.__RUNTIME__
        const { orderForm } = this.state

        const data = {
            userProfileId: this.getUserProfileId(orderForm),
            orderFormId: orderFormId
        }

        axios.post(createUrlRemoveCart(account, workspace), qs.stringify(data))
            .then(response => {
                this.removeItem(orderFormId)
                this.handleUpdateSuccess('Carrinho removido com sucesso!')
            })
            .catch((error) => {
                this.handleUpdateError(error.response)
            })
    }

    useCart(orderFormId) {
        const { account, workspace } = window.__RUNTIME__
        const { orderForm, items } = this.state
        const vtexIdclientAutCookie = `VtexIdclientAutCookie_${account}=${getCookie(`VtexIdclientAutCookie_${account}`)}`
        const data = {
            userProfileId: this.getUserProfileId(orderForm),
            orderFormId: orderFormId,
            vtexIdclientAutCookie: vtexIdclientAutCookie
        }

        axios.post(createUrlUseCart(account, workspace), qs.stringify(data))
            .then(response => {
                setCookie('checkout.vtex.com', '', -1)
                setCookie('checkout.vtex.com', `__ofid=${orderFormId}`, 30)

                location.reload()
            })
            .catch((error) => {
                this.handleUpdateError(error.response)
            })
    }

    verifyCart(orderFormId) {
        const { account, workspace } = window.__RUNTIME__
        const { orderForm, items } = this.state

        if (document.getElementById(`accordion-use-${orderFormId}`).checked) {
            document.getElementById(`accordion-use-${orderFormId}`).checked = false
            return
        }

        if (items.some(val => val.orderFormId === orderForm.orderFormId)) {
            document.getElementById(`accordion-use-${orderFormId}`).checked = false
            useCart(orderFormId)
        } else {
            document.getElementById(`accordion-use-${orderFormId}`).checked = true
        }
    }

    listCarts() {
        const { account, workspace } = window.__RUNTIME__
        const { orderForm } = this.state
        const userProfileId = orderForm ? this.getUserProfileId(orderForm) : ''
        const vtexIdclientAutCookie = `VtexIdclientAutCookie_${account}=${getCookie(`VtexIdclientAutCookie_${account}`)}`
        const data = {
            userProfileId: userProfileId,
            vtexIdclientAutCookie: vtexIdclientAutCookie
        }

        return axios.post(`${createUrlListCarts(account, workspace)}`, data)
            .then(response => response.data)
            .catch(error => { throw error })
    }

    removeItem(orderFormId) {
        let items = this.state.items
        const indexItem = items.findIndex(val => val.orderFormId === orderFormId)

        items.splice(indexItem, 1)
        this.setState({ items: items })
    }

    openModal() {
        if (this.openMyCarts()) {
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
                    if (error.response && error.response.data && error.response.data.errorMessage && error.response.data.errorMessage != "") {
                        this.handleProfileError(error.response.data.errorMessage)
                    } else {
                        this.handleProfileError(error)
                    }
                })
        } else {
            Promise.resolve(window.vtexid.start())
        }
    }

    closeModal() {
        this.clearMessages()
        this.setState({ isModalOpen: false })
    }

    updateNameCart({ target: { value } }) {
        this.setState({ nameCart: value })
    }

    render() {
        const { buttonName, items, error, messageSuccess } = this.state
        const DISABLED_CLASSES = 'bg--light-silver white'
        const disabled = this.state.nameCart.length == 0
        const classes = disabled ? DISABLED_CLASSES : ''

        return (
            <div>
                <button className="btn btn-primary fr" onClick={this.openModal} >
                    {buttonName}
                </button>
                <Modal show={this.state.isModalOpen} onClose={this.closeModal}>
                    <section className="bg-washed-blue bb b--black-20 pa3 br3 br--top">
                        <button onClick={this.closeModal} className="close nt1-m" data-dismiss="modal">&times;</button>
                        <h4 className="f4 white mv0 mt0-m">Cadastrar e listar carrinhos</h4>
                    </section>
                    <section className="bb b--black-50">
                        {
                            messageSuccess && messageSuccess.length > 0
                                ? (
                                    <div className="w-100 pt3">
                                        <div className="w-80-ns center br2 pv3 ph3 bg-washed-green green">
                                            {messageSuccess}
                                            <a className="item-link-remove" title="Remover" onClick={this.clearMessages}>
                                                <i className="icon icon-remove item-remove-ico fr" >
                                                </i>
                                                <span className="hide item-remove-text" >Remover</span>
                                            </a>
                                        </div>
                                    </div>
                                )
                                :
                                null
                        }
                        {
                            error && error.length > 0
                                ? (
                                    <div className="w-100 pt3">
                                        <div className="w-80-ns center br2 pv3 ph3 bg-washed-red red">
                                            {error}
                                            <a className="item-link-remove" title="Remover" onClick={this.clearMessages}>
                                                <i className="icon icon-remove item-remove-ico fr" >
                                                </i>
                                                <span className="hide item-remove-text" >Remover</span>
                                            </a>
                                        </div>
                                    </div>
                                )
                                :
                                null
                        }
                        <div className="pa3 black-80">
                            <div>
                                <label htmlFor="comment" className="f6 b db mb2">Nome: </label>
                                <textarea id="comment" onChange={this.updateNameCart} name="comment" className="db border-box hover-black w-100 ba b--black-20 pa2 br2 mb2" value={this.state.nameCart} placeholder="Digite o nome do carrinho"></textarea>
                            </div>
                            <button disabled={disabled} className={`btn btn-primary ${classes}`} onClick={() => this.saveCart(this.state.nameCart)}>
                                Salvar
                            </button>
                        </div>
                    </section>
                    <ListCart items={items} handleRemoveCart={this.removeCart} handleUseCart={this.useCart} handleVerifyCart={this.verifyCart} />
                </Modal>
            </div>
        )
    }
}

export default SaveCart