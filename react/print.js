import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'

import { printSchema, formatCartToPrint, formatDate, formatCurrency } from './utils'
import Table from '@vtex/styleguide/lib/Table'
import Button from '@vtex/styleguide/lib/Button'
import NewWindow from './newWindow'

import {map, mapObjIndexed} from 'ramda'

const DEFAULT_ADDRESS = {
  city: '',
  complement: '',
  country: '',
  neighborhood: '',
  number: '',
  postalCode: '',
  state: '',
  street: '',
}

class Print extends Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      isPrinting: false,
    }
    this.handlePrint = this.handlePrint.bind(this)
  }

  handlePrint(popup) {
    return () => {
      this.setState({ printing: true }, () => {
        popup.print()
        this.props.finishedPrinting()
      })
    }
  }

  render() {
    const { cartToPrint, cartLifeSpan, storePreferencesData, storeLogoUrl, finishedPrinting, clientProfileData: { corporateName, corporateDocument: cnpj }, representative } = this.props
    const items = formatCartToPrint(cartToPrint.items, storePreferencesData)
    const creationDate = formatDate(cartToPrint.creationDate)
    const expirationDate = formatDate(cartToPrint.creationDate, cartLifeSpan)
    const { subtotal, discounts, shipping, total, paymentTerm, address } = cartToPrint
    const shippingAddress = address || DEFAULT_ADDRESS
    return (
      <NewWindow onUnload={finishedPrinting}>
        {popup => {
          return (
            <div className="onda-v1">
              <div className="pa4">
                <div className={`${this.state.printing ? 'dn' : 'mt7 mb7'}`}>
                  <Button id="vtex-cart-list-print-button" onClick={this.handlePrint(popup)}><FormattedMessage id="list.print" /></Button>
                </div>
                <div className="mb5">
                  <img src={storeLogoUrl} />
                </div>
                <div className="mw5 center ttu f2 pv5 fw6">
                  <FormattedMessage id="quote" />
                </div>
                <div className="mb7">
                  <div className="mb2">
                    <FormattedMessage id="print.representative.name" />: {representative.userName}
                  </div>
                  <div className="mb2">
                    <FormattedMessage id="print.representative.email" />: {representative.userEmail}
                  </div>
                  <div className="mb2">
                    <FormattedMessage id="print.customer" />: {corporateName}
                  </div>
                  <div className="mb2">
                    <FormattedMessage id="print.document" />: {cnpj}
                  </div>
                  <div className="mb2">
                    <FormattedMessage id="print.quote.name" />: {cartToPrint.cartName}
                  </div>
                  <div className="mb2">
                    <FormattedMessage id="list.quote.date" />: {creationDate}
                  </div>
                  <div className="mb2">
                    <FormattedMessage id="list.quote.expire" />: {expirationDate}
                  </div>
                  <div className="mb4">
                    <FormattedMessage id="print.paymentterm" />: {paymentTerm}
                  </div>
                  <div className="mb2">
                    <FormattedMessage id="print.address" />:
                  </div>
                  <div className={`${address ? 'ml5' : 'dn'}`}>
                    <div>
                      <FormattedMessage id="print.address.street" />: {shippingAddress.street}
                    </div>
                    <div>
                      <FormattedMessage id="print.address.number" />: {shippingAddress.number}
                    </div>
                    <div className={`${shippingAddress.complement ? '' : 'dn'}`}>
                      <FormattedMessage id="print.address.complement" />: {shippingAddress.complement}
                    </div>
                    <div>
                      <FormattedMessage id="print.address.neighborhood" />: {shippingAddress.neighborhood}
                    </div>
                    <div>
                      <FormattedMessage id="print.address.city" />: {shippingAddress.city}
                    </div>
                    <div>
                      <FormattedMessage id="print.address.state" />: {shippingAddress.state}
                    </div>
                    <div>
                      <FormattedMessage id="print.address.postalCode" />: {shippingAddress.postalCode}
                    </div>
                    <div>
                      <FormattedMessage id="print.address.country" />: {shippingAddress.country}
                    </div>
                  </div>
                </div>
                <div className="mt4 mb7">
                  {this.makeTable(items)}
                </div>
                <div className="fr pr7 mr7">
                  <div className="fr pr7 mr7 f4">
                    <div>
                      <FormattedMessage id="print.subtotal" />: {formatCurrency(subtotal, storePreferencesData)}
                    </div>
                    <div>
                      <FormattedMessage id="print.discounts" />: {formatCurrency(discounts, storePreferencesData)}
                    </div>
                    <div>
                      <FormattedMessage id="print.shipping" />: {formatCurrency(shipping, storePreferencesData)}
                    </div>
                    <div>
                      <FormattedMessage id="print.total" />: {formatCurrency(total, storePreferencesData)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }}
      </NewWindow>
    )
  }

  makeTable = (items) => {
    return (
      <table>
        <tr className="bb">
          <th className="fw7 f4 pv2 tl"><FormattedMessage id="list.item" /></th>
          <th className="fw7 f4 pv2 tl"><FormattedMessage id="list.quantity" /></th>
          <th className="fw7 f4 pv2 tl"><FormattedMessage id="list.price" /></th>
        </tr>
        {this.makeRows(items)}
      </table>
    )
  }

  makeRows = items => map(item => this.makeRow(item), items)

  makeRow = item => (
    <tr className="bb">
      <td className="fw2 f5 pv6">{item.name}</td>
      <td className="fw2 f5 pv6">{item.quantity}</td>
      <td className="fw2 f5 pv6">{item.formattedPrice}</td>
    </tr>
  )
}

Print.propTypes = {
  cartToPrint: PropTypes.object,
  cartLifeSpan: PropTypes.number,
  clientProfileData: PropTypes.object,
  finishedPrinting: PropTypes.func,
  storePreferencesData: PropTypes.obj,
  storeLogoUrl: PropTypes.string,
  total: PropTypes.number,
  totalizers: PropTypes.array,
  representative: PropTypes.object,
}

export default Print
