import React, { Component } from 'react'

class Loading extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const style = this.props.visible ? { } : { display: 'none' }

        return (
            <span style={style}>
                <i className="icon-spinner icon-spin icon-2x"></i>
            </span>
        )
    }
}

export default Loading