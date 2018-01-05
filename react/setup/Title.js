import React, { Component } from 'react'
import PropTypes from 'prop-types'

// eslint-disable-next-line
class Title extends Component {
  render () {
    const {children} = this.props
    return (
      <div className="bb b--clean-blue mb3">
        <h1 className="mb2 fw6 font-display">
          {children}
        </h1>
      </div>
    )
  }
}

Title.propTypes = {
  children: PropTypes.node,
}

export default Title
