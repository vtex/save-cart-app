import React, { Component } from 'react'

class ListProduct extends Component {
  constructor(props) {
    super(props)
    this.createItem = this.createItem.bind(this)
    this.formatPrice = this.formatPrice.bind(this)
  }

  formatPrice(value) {
    return (value / 100).toFixed(2).toString(10)
  }

  createItem(item) {
    return <li className="flex items-center lh-copy pa3 bb b--black-10" key={`product-${item.id}`}>
      <img className="w2 h2 w3-ns h3-ns br-100" src={item.imageUrl} />
      <div className="pl3 flex-auto pr1">
        <span className="f6 db black-70">{item.skuName}</span>
        <span className="f6 db black-70">{this.formatPrice(item.price)}</span>
      </div>
      <div className="pr1">
        <span className="f6 black b hover-dark-gray">{item.quantity}</span>
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
