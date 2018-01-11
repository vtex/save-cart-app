import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ItemCart from './ItemCart'

class ListCart extends Component {
    
    render() {
        const { handleRemoveCart, handleUseCart, handleVerifyCart } = this.props
        const items = this.props.items.map(item => {
            return <ItemCart key={item.orderFormId} item={item} handleRemoveCart={handleRemoveCart} handleUseCart={handleUseCart} handleVerifyCart={handleVerifyCart} />
        })
        return (
            <div className="overflow-hidden overflow-y-scroll h5">
                {items.length > 0 ?
                    <ul className="list pl0 mt0 center overflow-hidden">
                        {
                            items
                        }
                    </ul>
                    : <label className="f6 center">Sua lista está vazia</label>
                }
            </div>
        )
    }
}

ListCart.propTypes = {
    handleRemoveCart: PropTypes.func,
    handleUseCart: PropTypes.func,
    handleVerifyCart: PropTypes.func
}

export default ListCart