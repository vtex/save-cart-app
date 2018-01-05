import React, { Component } from 'react'

class ListProduct extends Component {
    constructor(props) {
        super(props)

        this.createItem = this.createItem.bind(this)
    }

    createItem(item) {
        return <li className="flex items-center lh-copy pa3 bb b--black-10" key={`product-${item.uniqueId}`}>
            <img className="w2 h2 w3-ns h3-ns br-100" src={item.imageUrl} />
            <div className="pl3 flex-auto pr1">
                <span className="f6 db black-70">{item.name}</span>
                <span className="f6 db black-70">{item.price}</span>
            </div>
            <div className="pr1">
                <span className="f6 blue hover-dark-gray">{item.quantity}</span>
            </div>
        </li>
    }

    render() {
        const products = this.props.products.map(this.createItem)

        return (
            <ul className="list pl0 mt0 center">
                {
                    products
                }
            </ul>
        )
    }
}

export default ListProduct