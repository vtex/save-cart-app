import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ItemCart from './ItemCart'
import { FormattedMessage, injectIntl} from 'react-intl'

class ListCart extends Component {
  render() {
    const { handleRemoveCart, handleUseCart, cartLifeSpan } = this.props
    const items = this.props.carts.map(cart => {
      return <ItemCart key={cart.id} cart={cart} handleRemoveCart={handleRemoveCart} handleUseCart={handleUseCart} cartLifeSpan={cartLifeSpan}/>
    })
    return (
      <div className="overflow-y-scroll vh-50">
        {items.length > 0
          ? <ul className="list pl0 mt0 center overflow-hidden">
            <li className="fl w-100 items-center lh-copy pa3 bb b--black-10 bg-light-silver">
              <div className="fl w-20-ns flex-auto pv2">
                <span className="f6 db black-70 ttu b">
                  Data da cotação
                </span>
              </div>
              <div className="fl w-20-ns flex-auto pv2">
                <span className="f6 db black-70 ttu b">
                  Data de expiração
                </span>
              </div>
              <div className="fl w-100 w-30-ns flex-auto pv2">
                <span className="f6 db black-70 ttu b">
                  Nome
                </span>
              </div>
              <div className="fl w-100 w-10-ns flex-auto pv2">
                <span className="f6 db black-70 ttu b">
                  Itens
                </span>
              </div>
            </li>
            {
                items
            }
          </ul>
          : <div className="tc"><p className="f6"><FormattedMessage id="list.empty"/></p></div>
        }
      </div>
    )
  }
}

ListCart.propTypes = {
  handleRemoveCart: PropTypes.func,
  handleUseCart: PropTypes.func,
  carts: PropTypes.array,
  cartLifeSpan: PropTypes.number,
}

export default ListCart
