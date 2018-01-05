import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Button extends Component {
    constructor(props) {
        super(props)

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        this.props.onClick()
    }

    render() {
        const { children } = this.props
        return (
            <button onClick={this.handleClick} >
                {children}
            </button>
        )
    }
}

Button.defaultProps = {
    onClick: () => { }
}

Button.propTypes = {
    onClick: PropTypes.func,
    children: PropTypes.node
}

export default Button