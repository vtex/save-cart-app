import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ListProduct from './ListProduct'

class Item extends Component {
    constructor(props) {
        super(props)

    }

    render() {
        const { item } = this.props

        return (
            <li className="fl w-100 items-center lh-copy pa3 bb b--black-10 overflow-hidden">
                
                
                {/* Confirmation */}
                <input id={`accordion-use-${item.orderFormId}`} type="checkbox" name="tabs" className="accordion-use-cart" />
                <div className="fl w-100 mb2 accordion-content-use-cart">
                    <p className="tc pa1">Deseja usar o carrinho <b>'</b>{item.name}<b>'</b> sem salvar o carrinho atual? </p>
                    <a className="btn btn-danger pr3 ph3 fl mw4 ma1 db center fn mb1" onClick={() => this.props.handleUseCart(item.orderFormId)}>
                        <span className="f6">Continuar</span>
                    </a>
                </div>

                <input id={`accordion-add-${item.orderFormId}`} type="checkbox" name="tabs" className="accordion-add-cart" />

                <div className="fl w-60 pl4 flex-auto pointer pt1">
                    <label htmlFor={`accordion-add-${item.orderFormId}`} className="f6 db b ttu black-70">
                        {item.name}
                    </label>
                </div>

                <div className="fl w-20" onClick={() => this.props.handleVerifyCart(item.orderFormId)}>
                    <div className="f6 br3 link dim ph3 pv2 mb2 dib white bg-mid-gray pointer">
                        Usar
                    </div>
                </div>

                <div className="fl w-20" onClick={() => this.props.handleRemoveCart(item.orderFormId)}>
                    <div className="f6 br3 link dim ph3 pv2 mb2 dib white bg-dark-red pointer" title="Remover">
                        Remover
                    </div>
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

Item.propTypes = {
    handleRemoveCart: PropTypes.func,
    handleUseCart: PropTypes.func,
    handleVerifyCart: PropTypes.func
}

export default Item