import React, { Component } from 'react'
import PropTypes from 'prop-types'

// eslint-disable-next-line
class ValidationMessages extends Component {
  render () {
    const {messages} = this.props
    if (messages.length === 0) {
      return null
    }
    return (
      <div>
        <ul className="list mv2 pa0">
          {
            messages.map((message, idx) => (
              <li key={idx} className="w-100 dark-red mb1 f6">
                - {message}
              </li>
            ))
          }
        </ul>
      </div>
    )
  }
}

ValidationMessages.propTypes = {
  messages: PropTypes.array,
}

export default ValidationMessages
