import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Messages extends Component {

    getTypeMessage(type) {
        switch (type) {
            case 'success':
                return 'bg-washed-green green'
            case 'error':
                return 'bg-washed-red red'
            default:
                return ''
        }
    }

    render() {
        const { message, type, clearMessage } = this.props
        const typeClass = this.getTypeMessage(type)

        return (
            <div className="w-100 pt3">
                <div className={`w-80-ns center br2 pv3 ph3 ${typeClass}`}>
                    <a className="item-link-remove" onClick={clearMessage}>
                        <i className="icon icon-remove item-remove-ico fr"></i>
                    </a>
                    {message}
                </div>
            </div>
        )
    }
}

Messages.propTypes = {
    type: PropTypes.string,
    message: PropTypes.string,
    clearMessage: PropTypes.func
}

Messages.defaultProps = {
    type: '',
    message: '',
    clearMessage: () => { }
}

export default Messages