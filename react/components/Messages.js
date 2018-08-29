import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Alert from '@vtex/styleguide/lib/Alert'

class Messages extends Component {
  render() {
    const { message, type, clearMessage } = this.props

    return (
      // <div className="w-100 pt3">
      //   <div className={`w-80-ns center br2 pv4 ph5 mb4 ${typeClass}`}>
      //     {message}
      //     <a className="item-link-remove" onClick={clearMessage}>
      //       <i className="icon icon-remove item-remove-ico fr"></i>
      //     </a>
      //   </div>
      // </div>
      <div>
        <div className="">
          <Alert type={type} onClose={clearMessage}>
            {message}
          </Alert>
        </div>
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
