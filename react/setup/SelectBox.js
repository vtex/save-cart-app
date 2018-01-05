import React, { Component } from 'react'
import PropTypes from 'prop-types'

class SelectBox extends Component {
    constructor(props) {
        super(props)

        this.handleChange = this.handleChange.bind(this)
        this.createListOptions = this.createListOptions.bind(this)
    }

    handleChange(e) {        
        this.props.onChange(e)
    }

    createListOptions(options) {
        return options.map(option => (
            <option key={option} value={option}>
                {option}
            </option>
        ))
    }

    render() {
        const { id, value, options } = this.props
        const selectClasses = 'w-100 ba h2 br2 mt1 pa2 outline-0'

        return (
            <select
                id={id}
                className={selectClasses}
                value={value}
                onChange={this.handleChange}
            >
                {this.createListOptions(options)}
            </select>
        )
    }

}

SelectBox.defaultProps = {
    value: '',
    onChange: () => { },
}

SelectBox.propTypes = {
    id: PropTypes.string,
    value: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
}

export default SelectBox