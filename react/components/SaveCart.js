import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from './Button'

class SaveCart extends Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      nameCart: '',
    }

    this.handleUpdateNameCart = this.handleUpdateNameCart.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  handleUpdateNameCart({ target: { value } }) {
    this.setState({ nameCart: value })
  }

  handleClick() {
    this.props.onClick(this.state.nameCart, this.props.cartLifeSpan)
  }

  render() {
    return (
      <div className="pa1 pa2-ns overflow-auto">
        <div className="fl w-100 w-20-ns flex-auto">
          <label htmlFor="nameCart" className="f6 b pt2">Nome: </label>
        </div>
        <div className="fl w-100 w-60-ns flex-auto">
          <input id="comment" onChange={this.handleUpdateNameCart} name="nameCart" className="border-box hover-black w-90 ba b--black-20 pa2 br2 mb2" value={this.state.nameCart}></input>
        </div>
        <div className="fl w-100 w-20-ns flex-auto">
          <Button classes={"ph3 mb2 white bg-blue"} onClick={this.handleClick}>
            Salvar
          </Button>
        </div>
      </div>
    )
  }
}

SaveCart.propTypes = {
  onClick: PropTypes.func,
  cartLifeSpan: PropTypes.number,
}

SaveCart.defaultProps = {
  onClick: () => { },
}

export default SaveCart
