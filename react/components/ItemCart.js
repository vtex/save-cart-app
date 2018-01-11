import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ListProduct from './ListProduct'
import Button from './Button'

class ItemCart extends Component {
    
    openAccordion(name, orderFormId) {
        let accordionClass = document.getElementById(`accordion-${name}-${orderFormId}`).classList;

        if (accordionClass.contains("db")) {
            accordionClass.remove("db");
        } else {
            accordionClass.add("db");
        }
        if (accordionClass.contains("dn")) {
            accordionClass.remove("dn");
        } else {
            accordionClass.add("dn");
        }
    }

    render() {
        const { item } = this.props

        return (
            <li className="fl w-100 items-center lh-copy pa3 bb b--black-10 overflow-hidden">
                {/* Confirmation */}
                <input type="checkbox" name="tabs" className="absolute o-0 z-0" />

                <div id={`accordion-use-${item.orderFormId}`} className="fl w-100 mb2 overflow-hidden dn">
                    <p className="tc pa1">Deseja usar o carrinho <b>'</b>{item.name}<b>'</b> sem salvar o carrinho atual? </p>
                    <a className="btn btn-danger pr3 ph3 fl mw4 ma1 db center fn mb1" onClick={() => this.props.handleUseCart(item.orderFormId)}>
                        <span className="f6">Continuar</span>
                    </a>
                </div>

                <input type="checkbox" name="tabs" className="absolute o-0 z-0" />

                <div className="fl w-100 w-50-ns flex-auto pointer pv2">
                    <a onClick={() => this.openAccordion('add', item.orderFormId)} className="f6 db b ttu black-70 no-underline">
                        {item.name}
                    </a>
                </div>

                <div className="fl w-50 w-25-ns flex-auto pr2">
                    <Button classes={"w-100 white bg-blue"} onClick={() => this.props.handleUseCart(item.orderFormId)}>
                        Usar
                    </Button>
                </div>

                <div className="fl w-50 w-25-ns flex-auto pr2">
                    <Button classes={"w-100 white bg-dark-red"} onClick={() => this.props.handleRemoveCart(item.orderFormId)}>
                        Excluir
                    </Button>
                </div>

                <div id={`accordion-add-${item.orderFormId}`} className="fl w-100 overflow-hidden overflow-y-scroll dn">
                    {
                        <ListProduct products={item.products} />
                    }
                </div>
            </li>
        )
    }
}

ItemCart.propTypes = {
    handleRemoveCart: PropTypes.func,
    handleUseCart: PropTypes.func,
    handleVerifyCart: PropTypes.func,
    handleOpenCartAdd: PropTypes.func
}

export default ItemCart