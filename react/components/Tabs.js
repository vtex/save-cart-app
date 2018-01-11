import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Messages from './Messages'

class Tabs extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            activeTabIndex: this.props.defaultActiveTabIndex
        };
        this.handleTabClick = this.handleTabClick.bind(this)
    }

    // Toggle currently active tab
    handleTabClick(tabIndex) {
        this.setState({
            activeTabIndex: tabIndex
        });
    }

    // Encapsulate <Tabs/> component API as props for <Tab/> children
    renderChildrenWithTabsApiAsProps() {
        return React.Children.map(this.props.children, (child, index) => {
            return React.cloneElement(child, {
                onClick: this.handleTabClick,
                tabIndex: index,
                isActive: index === this.state.activeTabIndex
            });
        });
    }

    // Render current active tab content
    renderActiveTabContent() {
        const { children } = this.props
        const { activeTabIndex } = this.state
        if (children[activeTabIndex]) {
            return children[activeTabIndex].props.children
        }
    }

    render() {
        const { messageSuccess, messageError, clearMessage } = this.props
        const hasMessageSuccess = messageSuccess && messageSuccess.length > 0
        const hasMessageError = messageError && messageError.length > 0
        const hasMessage = hasMessageSuccess || hasMessageError

        return (
            <div>
                <nav className="bb b--black-20 tc center">
                    {this.renderChildrenWithTabsApiAsProps()}
                </nav>
                {
                    hasMessage ?
                        <div className="ma2">
                            {hasMessageSuccess ? <Messages type={'success'} clearMessage={clearMessage} message={messageSuccess} /> : null}
                            {hasMessageError ? <Messages type={'error'} clearMessage={clearMessage} message={messageError} /> : null}
                        </div>
                        : null
                }
                <div className="ma2">
                    {this.renderActiveTabContent()}
                </div>
            </div>
        );
    }
}

Tabs.propTypes = {
    defaultActiveTabIndex: PropTypes.number,
    messageSuccess: PropTypes.string,
    messageError: PropTypes.string,
    clearMessage: PropTypes.func
}

Tabs.defaultProps = {
    defaultActiveTabIndex: 0,
    messageSuccess: '',
    messageError: '',
    clearMessage: () => { }
}

export default Tabs