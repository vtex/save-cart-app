import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Cart from './Cart'

class ListCart extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { handleRemoveCart } = this.props
        
        const items = this.props.items.map(item => {
            return <Cart key={item.orderFormId} item={item} handleRemoveCart={handleRemoveCart} />
        })

        return (
            <section className="overflow-hidden">
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
}

export default ListCart