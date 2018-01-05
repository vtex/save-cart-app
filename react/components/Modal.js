import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Modal extends Component {
    render() {
        // Render nothing if the "show" prop is false
        if (!this.props.show) {
            return null
        }

        // The gray background
        const backdropStyle = {
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: 40,
            zIndex: '9998'
        }

        // The modal "window"
        const modalStyle = {
            backgroundColor: '#fff',
            margin: '0 auto',
            padding: 0,
            zIndex: '9999'
        }

        return (
            <div style={backdropStyle}>
                <div style={modalStyle} className="br3 modalStyleWidth">
                    {this.props.children}
                </div>
            </div>
        )
    }
}

Modal.propTypes = {
    onClose: PropTypes.func.isRequired,
    show: PropTypes.bool,
    children: PropTypes.node
};

export default Modal