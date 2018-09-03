import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'

import Button from '@vtex/styleguide/lib/Button'
import Input from '@vtex/styleguide/lib/Input'

class SaveCart extends Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      nameCart: '',
    }

    this.handleUpdateNameCart = this.handleUpdateNameCart.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.input = React.createRef()
  }

  componentDidMount() {
    this.input.current.focus()
  }

  handleUpdateNameCart({ target: { value } }) {
    this.setState({ nameCart: value })
  }

  handleClick() {
    this.props.onClick(this.state.nameCart)
  }

  handleFocusClick = () => {
    this.input.current.focus()
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.handleClick()
    }
  }

  render() {
    return (
      <div className="pa1 pa2-ns mt7 flex justify-center">
        <div className="w-10">
          <label onClick={this.handleFocusClick} className="f6 b pt2"><FormattedMessage id="modal.name" /> </label>
        </div>
        <div className="w-70">
          <Input ref={this.input} onKeyPress={this.handleKeyPress} maxLength="60" size="x-large" onChange={this.handleUpdateNameCart} value={this.state.nameCart} />
        </div>
        <div className="w-20 ml5">
          <Button size="small" onClick={this.handleClick}>
            <FormattedMessage id="modal.save" />
          </Button>
        </div>
      </div>
    )
  }
}

SaveCart.propTypes = {
  onClick: PropTypes.func,
}

SaveCart.defaultProps = {
  onClick: () => { },
}

export default SaveCart
