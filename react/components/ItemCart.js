import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import Button from '@vtex/styleguide/lib/Button'
import Delete from '@vtex/styleguide/lib/icon/Delete'
import _ from 'underscore'

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
    const { cart, cartLifeSpan } = this.props
    const cartQuantity = _.reduce(cart.items, function(memo, item) { return memo + item.quantity }, 0)

    const formatDate = (date, cartLifeSpan = 0) => {
      const tempDate = new Date(date)
      if (cartLifeSpan > 0) {
        tempDate.setDate(tempDate.getDate() + cartLifeSpan)
      }
      return `${tempDate.getDate()}/${tempDate.getMonth() + 1}/${tempDate.getFullYear()}`
    }

    return (
      <li className="fl w-100 items-center lh-copy pa3 bb b--black-10">

        <div className="fl w-20-ns flex-auto pv2">
          <span className="f6 db black-70">
            {formatDate(cart.creationDate)}
          </span>
        </div>

        <div className="fl w-20-ns flex-auto pv2">
          <span className="f6 db black-70">
            {formatDate(cart.creationDate, cartLifeSpan)}
          </span>
        </div>

        <div className="fl w-100 w-30-ns flex-auto pv2">
          <span className="f6 db black-70">
            {cart.cartName}
          </span>
        </div>

        <div className="fl w-100 w-10-ns flex-auto pv2">
          <span className="f6 db black-70">
            {cartQuantity}
          </span>
        </div>

        <div className="fl w-50 w-20-ns flex-auto pr2 tr">
          <Button variation="primary" size="small" onClick={() => this.handleVerifyItem(cart.id)}>
            <FormattedMessage id="cart.use" />
          </Button>
          <Button variation="tertiary" size="small" onClick={() => this.openAccordion('delete', cart.id)}>
            <Delete size={15} />
          </Button>
        </div>

        <div id={`accordion-use-${cart.id}`} name="accordion" className="fl w-100 tc pa2 mv3 ba b--light-gray bg-light-silver dn">
          <p className="f6">Deseja usar a cotação <b>"{cart.cartName}"</b>? Ela vai sobrescrever o seu carrinho atual.</p>
          <Button variation="tertiary" size="small" onClick={() => this.openAccordion('use', cart.id)}><FormattedMessage id="cart.no" /></Button>
          <Button variation="primary" size="small" onClick={() => this.props.handleUseCart(cart)}><FormattedMessage id="cart.yes" /></Button>
        </div>

        <div id={`accordion-delete-${cart.id}`} name="accordion" className="fl w-100 tc pa2 mv3 ba b--light-gray bg-light-silver dn">
          <p className="f6"><FormattedMessage id="cart.delete.1" /> <b><FormattedMessage id="cart.delete.2" /></b> <FormattedMessage id="cart.quote" /> <b>"{cart.cartName}"</b>? Ao excluir o carrinho, os valores de cotação dos produtos escolhidos serão perdidos.</p>
          <Button variation="tertiary" size="small" onClick={() => this.openAccordion('delete', cart.id)}><FormattedMessage id="cart.no" /></Button>
          <Button variation="danger" size="small" onClick={() => this.props.handleRemoveCart(cart.id)}><FormattedMessage id="cart.delete.yes" /></Button>
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
  cartLifeSpan: PropTypes.number,
}

export default ItemCart
