import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ItemCart from './ItemCart'
import { FormattedMessage, injectIntl} from 'react-intl' 


class ListCart extends Component {
  render() {
    const { handleRemoveCart, handleUseCart } = this.props
    const items = this.props.carts.map(cart => {
      return <ItemCart key={cart.id} cart={cart} handleRemoveCart={handleRemoveCart} handleUseCart={handleUseCart} />
    })
    return (
      <div className="overflow-y-scroll vh-50">
        {items.length > 0
          ? <ul className="list pl0 mt0 center overflow-hidden">
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
}

export default ListCart
