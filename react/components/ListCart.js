import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Item from './Item'

class ListCart extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { handleRemoveCart, handleUseCart, handleVerifyCart } = this.props
        const items = this.props.items.map(item => {
            return <Item key={item.orderFormId} item={item} handleRemoveCart={handleRemoveCart} handleUseCart={handleUseCart} handleVerifyCart={handleVerifyCart} />
        })

        return (
            <section className="overflow-hidden overflow-y-scroll h5">
                <ul className="list pl0 mt0 center overflow-hidden">
                    {
                        items
                    }
                </ul>
            </section>
        )
    }
}

ListCart.propTypes = {
    handleRemoveCart: PropTypes.func,
    handleUseCart: PropTypes.func,
    handleVerifyCart: PropTypes.func
}

export default ListCart