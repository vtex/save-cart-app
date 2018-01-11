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
        const { children, classes } = this.props

        return (
            <button className={`bn f6 br3 dim ph3 pv2 dib ${classes}`} onClick={this.handleClick}>
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