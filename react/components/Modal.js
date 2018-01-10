import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Modal extends Component {
    render() {
        if (!this.props.show) {
            return null
        }

        return (
            <div className="fixed absolute--fill bg-black-30 pa3 pa4-ns z-999">
                <div className="w-100 w-80-m w-50-ns mv0 center pa0 br3 bg-white z-9999">
                    {this.props.children}
                </div>
            </div>
        )
    }
}

Modal.propTypes = {
    show: PropTypes.bool,
    children: PropTypes.node
};

export default Modal