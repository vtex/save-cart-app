import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ListProduct from './ListProduct'
import Button from './Button'

class ItemCart extends Component {
    constructor(props) {
        super(props)

        this.handleVerifyItem = this.handleVerifyItem.bind(this)
    }

    handleVerifyItem(orderFormId) {
        const { handleCurrentCartSaved, handleUseCart } = this.props
        const nameAccordion = 'use'

        this.closeAccordions(nameAccordion, orderFormId)

        if (handleCurrentCartSaved()) {
            handleUseCart(orderFormId)
        } else {
            this.openAccordion(nameAccordion, orderFormId)
        }
    }

    openAccordion(name, orderFormId) {
        this.closeAccordions(name, orderFormId)

        let accordionClass = document.getElementById(`accordion-${name}-${orderFormId}`).classList
        accordionClass.toggle('dn')
    }

    closeAccordions(name, orderFormId) {
        let elements = document.getElementsByName("accordion")

        for (const key in elements) {
            if (elements.hasOwnProperty(key)) {
                const element = elements[key]
                
                if (element.id === `accordion-${name}-${orderFormId}`) continue

                let accordionClass = element.classList

                if (!accordionClass.contains("dn")) {
                    accordionClass.toggle("dn")                    
                }
            }
        }
    }

    render() {
        const { item } = this.props

        return (
            <li className="fl w-100 items-center lh-copy pa3 bb b--black-10">
                <div className="fl w-100 w-50-ns flex-auto pointer pv2">
                    <a onClick={() => this.openAccordion('products', item.orderFormId)} className="f6 db b ttu black-70 no-underline">
                        {item.name}
                    </a>
                </div>

                <div className="fl w-50 w-25-ns flex-auto pr2">
                    <Button classes={"w-100 ph3 white bg-blue"} onClick={() => this.handleVerifyItem(item.orderFormId)}>
                        Usar
                    </Button>
                </div>

                <div className="fl w-50 w-25-ns flex-auto pr2">
                    <Button classes={"w-100 ph1 white bg-dark-red"} onClick={() => this.openAccordion('delete', item.orderFormId)}>
                        Excluir
                    </Button>
                </div>

                <div id={`accordion-use-${item.orderFormId}`} name="accordion" className="fl w-100 tc pa2 mv1 ba b--blue br3 dn">
                    <p className="f6">Deseja <b>usar</b> o carrinho <b>"{item.name}"</b>, sem salvar o carrinho atual?</p>
                    <Button classes={"white ph3 mh2 mb1 bg-blue "} onClick={() => this.props.handleUseCart(item.orderFormId)}>Sim</Button>
                    <Button classes={"white ph3 mh2 mb1 bg-dark-red"} onClick={() => this.openAccordion('use', item.orderFormId)}>Não</Button>
                </div>

                <div id={`accordion-delete-${item.orderFormId}`} name="accordion" className="fl w-100 tc pa2 mv1 ba b--dark-red br3 dn">
                    <p className="f6">Deseja <b>excluir</b> o carrinho <b>"{item.name}"</b>?</p>
                    <Button classes={"white ph3 mh2 mb1 bg-blue "} onClick={() => this.props.handleRemoveCart(item.orderFormId)}>Sim</Button>
                    <Button classes={"white ph3 mh2 mb1 bg-dark-red"} onClick={() => this.openAccordion('delete', item.orderFormId)}>Não</Button>
                </div>

                <div id={`accordion-products-${item.orderFormId}`} name="accordion" className="fl w-100 dn">
                    <ListProduct products={item.products} />
                </div>
            </li>
        )
    }
}

ItemCart.propTypes = {
    handleUseCart: PropTypes.func,
    handleRemoveCart: PropTypes.func,
    handleCurrentCartSaved: PropTypes.func
}

export default ItemCart