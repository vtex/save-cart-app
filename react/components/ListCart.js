import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ItemCart from './ItemCart'

class ListCart extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { handleRemoveCart, handleUseCart, handleVerifyCart } = this.props
        const items = this.props.items.map(item => {
            return <ItemCart key={item.orderFormId} item={item} handleRemoveCart={handleRemoveCart} handleUseCart={handleUseCart} handleVerifyCart={handleVerifyCart} />
        })
        return (
            <div className="overflow-hidden overflow-y-scroll h5">
                <ul className="list pl0 mt0 center overflow-hidden">
                    {
                        items
                    }
                </ul>
            </div>
        )
    }
}

ListCart.propTypes = {
    handleRemoveCart: PropTypes.func,
    handleUseCart: PropTypes.func,
    handleVerifyCart: PropTypes.func,
    enabled: PropTypes.bool
}

export default ListCart