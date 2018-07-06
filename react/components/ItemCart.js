import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ListProduct from './ListProduct'
import Button from './Button'

class ItemCart extends Component {
  constructor(props) {
    super(props)
    this.handleVerifyItem = this.handleVerifyItem.bind(this)
  }

  handleVerifyItem(cartId) {
    const nameAccordion = 'use'
    this.openAccordion(nameAccordion, cartId)
  }

  openAccordion(name, orderFormId) {
    this.closeAccordions(name, orderFormId)
    const accordionClass = document.getElementById(`accordion-${name}-${orderFormId}`).classList
    accordionClass.toggle('dn')
  }

  closeAccordions(name, orderFormId) {
    const elements = document.getElementsByName('accordion')

    for (const key in elements) {
      if (elements.hasOwnProperty(key)) {
        const element = elements[key]

        if (element.id === `accordion-${name}-${orderFormId}`) {
          continue
        }

        const accordionClass = element.classList

        if (!accordionClass.contains('dn')) {
          accordionClass.toggle('dn')
        }
      }
    }
  }

  render() {
    const { cart } = this.props

    return (
      <li className="fl w-100 items-center lh-copy pa3 bb b--black-10">
        <div className="fl w-100 w-50-ns flex-auto pointer pv2">
          <a onClick={() => this.openAccordion('products', cart.id)} className="f6 db b ttu black-70 no-underline">
            {cart.cartName}
          </a>
        </div>

        <div className="fl w-50 w-25-ns flex-auto pr2">
          <Button classes={'w-100 ph3 white bg-blue'} onClick={() => this.handleVerifyItem(cart.id)}>
            Usar
          </Button>
        </div>

        <div className="fl w-50 w-25-ns flex-auto pr2">
          <Button classes={'w-100 ph1 white bg-red'} onClick={() => this.openAccordion('delete', cart.id)}>
            Excluir
          </Button>
        </div>

        <div id={`accordion-use-${cart.id}`} name="accordion" className="fl w-100 tc pa2 mv1 ba b--blue br3 dn">
          <p className="f6">Deseja <b>usar</b> a cotação <b>"{cart.cartName}"</b>, ela vai sobrescrever seu carrinho atual?</p>
          <Button classes={'white ph3 mh2 mb1 bg-blue '} onClick={() => this.props.handleUseCart(cart)}>Sim</Button>
          <Button classes={'white ph3 mh2 mb1 bg-red'} onClick={() => this.openAccordion('use', cart.id)}>Não</Button>
        </div>

        <div id={`accordion-delete-${cart.id}`} name="accordion" className="fl w-100 tc pa2 mv1 ba b--dark-red br3 dn">
          <p className="f6">Deseja <b>excluir</b> a cotação <b>"{cart.cartName}"</b>?</p>
          <Button classes={'white ph3 mh2 mb1 bg-blue '} onClick={() => this.props.handleRemoveCart(cart.id)}>Sim</Button>
          <Button classes={'white ph3 mh2 mb1 bg-red'} onClick={() => this.openAccordion('delete', cart.id)}>Não</Button>
        </div>

        <div id={`accordion-products-${cart.id}`} name="accordion" className="fl w-100 dn">
          <ListProduct products={cart.items} />
        </div>
      </li>
    )
  }
}

ItemCart.propTypes = {
  handleUseCart: PropTypes.func,
  handleRemoveCart: PropTypes.func,
  item: PropTypes.object,
  cart: PropTypes.object,
}

export default ItemCart
