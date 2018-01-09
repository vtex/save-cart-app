import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ListProduct from './ListProduct'

class Cart extends Component {
    constructor(props) {
        super(props)

    }

    render() {
        const { item } = this.props

        return (
            <li className="fl w-100 items-center lh-copy pa3 bb b--black-10 overflow-hidden">
                <input id={`accordion-use-${item.orderFormId}`} type="checkbox" name="tabs" className="accordion-use-cart" />
                <div className="fl w-100 mb2 accordion-content-use-cart">
                    <p className="tc pa1">Deseja usar o carrinho <b>'</b>{item.name}<b>'</b> sem salvar o carrinho atual? </p>
                    <a className="btn btn-danger pr3 ph3 fl w-30 ma1 db center fn" onClick={() => this.props.handleUseCart(item.orderFormId)}>
                        <span className="f6">Continuar</span>
                    </a>
                </div>

                <div className="fl w-20">
                    <label className="btn btn-success dib tc pr3 ph3" onClick={() => this.props.handleVerifyCart(item.orderFormId)}>
                        <i className="fa fa-shopping-cart"></i>
                        <span className="f6 db">Usar</span>
                    </label>
                </div>

                <input id={`accordion-add-${item.orderFormId}`} type="checkbox" name="tabs" className="accordion-add-cart" />

                <div className="fl w-60 pl4 flex-auto pointer pt1">
                    <label htmlFor={`accordion-add-${item.orderFormId}`} className="f6 db black-70">{item.name}</label>
                </div>

                <div className="fl w-20 pt1">
                    <a className="item-link-remove" title="Remover">
                        <i className="icon icon-remove item-remove-ico fr" onClick={() => this.props.handleRemoveCart(item.orderFormId)}>
                        </i>
                        <span className="hide item-remove-text" >Remover</span>
                    </a>
                </div>

                <div className="fl w-100 accordion-content-add-cart">
                    {
                        <ListProduct products={item.products} />
                    }
                </div>
            </li>
        )
    }
}

Cart.propTypes = {
    handleRemoveCart: PropTypes.func,
    handleUseCart: PropTypes.func,
    handleVerifyCart: PropTypes.func
}

export default Cart