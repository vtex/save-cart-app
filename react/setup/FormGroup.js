import React, { Component } from 'react'
import PropTypes from 'prop-types'

// eslint-disable-next-line
class FormGroup extends Component {
  render () {
    const {className, children} = this.props
    return (
      <div className={`mb3 ${className}`}>
        {children}
      </div>
    )
  }
}

FormGroup.defaultProps = {
  className: '',
}

FormGroup.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}

export default FormGroup
