import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Messages from './Messages'

class MessageDisplay extends Component {
  render() {
    const { messageSuccess, messageError, clearMessage } = this.props
    const hasMessageSuccess = messageSuccess && messageSuccess.length > 0
    const hasMessageError = messageError && messageError.length > 0
    const hasMessage = hasMessageSuccess || hasMessageError

    return (
      <div>
        {hasMessage
          ? <div className="ma2">
            {hasMessageSuccess && <Messages type={'success'} clearMessage={clearMessage} message={messageSuccess} />}
            {hasMessageError && <Messages type={'error'} clearMessage={clearMessage} message={messageError} />}
          </div>
          : null
        }
      </div>
    )
  }
}

MessageDisplay.propTypes = {
  messageSuccess: PropTypes.string,
  messageError: PropTypes.string,
  clearMessage: PropTypes.func,
}

MessageDisplay.defaultProps = {
  messageSuccess: '',
  messageError: '',
  clearMessage: () => { },
}

export default MessageDisplay
