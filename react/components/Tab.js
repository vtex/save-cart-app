import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Tab extends Component {
  constructor(props, context) {
    super(props, context)
    this.handleTabClick = this.handleTabClick.bind(this)
  }

  handleTabClick(event) {
    event.preventDefault()
    this.props.onClick(this.props.tabIndex)
  }

  render() {
    const { isActive } = this.props
    const classes = isActive ? 'bg-light-silver b' : ''

    return (
      <div className={`f6 f5-ns bg-animate black-80 hover-bg-light-blue dib pa3 ph4-l pointer ${classes}`} onClick={this.handleTabClick}>
        {this.props.name}
      </div>
    )
  }
}

Tab.propTypes = {
  onClick: PropTypes.func,
  tabIndex: PropTypes.number,
  isActive: PropTypes.bool,
  name: PropTypes.string,
}

export default Tab
