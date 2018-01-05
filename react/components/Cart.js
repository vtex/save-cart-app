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
                <div className="fl w-20">
                    <a className="btn btn-success hover-silver dib tc pr3 ph3">
                        <i className="fa fa-shopping-cart"></i>
                        <span className="f6 db">Usar</span>
                    </a>
                </div>

                <input id={`accordion-${item.orderFormId}`} type="checkbox" name="tabs" className="accordionAddCart" />

                <div className="fl w-60 pl4 flex-auto pointer pt1">
                    <label htmlFor={`accordion-${item.orderFormId}`} className="f6 db black-70">{item.name}</label>
                </div>

                <div className="fl w-20 pt1">
                    <a className="item-link-remove" title="remover">
                        <i className="icon icon-remove item-remove-ico fr" onClick={() => this.props.handleRemoveCart(item.orderFormId)}>
                        </i>
                        <span className="hide item-remove-text" >Remover</span>
                    </a>
                </div>

                <div className="fl w-100 accordionContentAddCart">
                    {
                        <ListProduct products={item.products}/>
                    }
                </div>
            </li>
        )
    }
}

Cart.propTypes = {
    handleRemoveCart: PropTypes.func,
}

export default Cart