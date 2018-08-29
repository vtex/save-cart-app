import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Alert from '@vtex/styleguide/lib/Alert'

class Messages extends Component {
  render() {
    const { message, type, clearMessage } = this.props

    return (
      <div>
        <Alert type={type} onClose={clearMessage}>
          {message}
        </Alert>
      </div>
    )
  }
}

Messages.propTypes = {
  type: PropTypes.string,
  message: PropTypes.string,
  clearMessage: PropTypes.func,
}

Messages.defaultProps = {
  type: '',
  message: '',
  clearMessage: () => { },
}

export default Messages
