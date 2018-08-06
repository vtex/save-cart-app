import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Loading extends Component {
  render() {
    const style = this.props.visible ? { } : { display: 'none' }

    return (
      <span style={style}>
        <i className="icon-spinner icon-spin icon-2x"></i>
      </span>
    )
  }
}

Loading.propTypes = {
  visible: PropTypes.bool,
}

export default Loading
