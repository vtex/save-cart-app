import React, { Component } from 'react'
import PropTypes from 'prop-types'

const DISABLED_CLASSES = 'bg--light-silver white'

// eslint-disable-next-line
class Button extends Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    this.props.onClick()
  }

  getSizeClass (size) {
    switch (size) {
      case 'small':
        return 'pa2'
      case 'medium':
        return 'pa2'
      case 'large':
        return 'pa4'
      default:
        return ''
    }
  }

  getTypeClass (type) {
    switch (type) {
      case 'primary':
        return 'bg-primary white'
      case 'secondary':
        return 'bg--light-silver white'
      case 'danger':
        return 'bg-light-red white'
      case 'confirm':
        return 'bg-green white'
      default:
        return ''
    }
  }

  render () {
    const {children, type, size, disabled} = this.props
    const sizeClass = this.getSizeClass(size)
    const typeClass = disabled ? DISABLED_CLASSES : this.getTypeClass(type)
    const classes = `${sizeClass} ${typeClass}`
    return (
      <button
        disabled={disabled}
        className={`w-100 font-display fw5 bn br2 pa3 pa2-ns f4 mt3 lh-copy mb4 ${classes}`}
        onClick={this.handleClick}
      >
        {children}
      </button>
    )
  }
}

Button.defaultProps = {
  size: 'medium',
  type: 'primary',
  disabled: false,
  onClick: () => {},
}

Button.propTypes = {
  type: PropTypes.string,
  size: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  disabled: PropTypes.bool,
}

export default Button
