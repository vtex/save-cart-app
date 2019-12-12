import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'

import { formatCartList, itemSchema } from '../utils'
import EmptyState from '@vtex/styleguide/lib/EmptyState'
import Table from '@vtex/styleguide/lib/Table'
import Modal from '@vtex/styleguide/lib/Modal'
import Button from '@vtex/styleguide/lib/Button'

class ListCart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isUseModalOpen: false,
      isRemoveModalOpen: false,
      useData: [],
      removeData: '',
      cartName: '',
    }
    this.handleOpenUseModal = this.handleOpenUseModal.bind(this)
    this.handleOpenRemoveModal = this.handleOpenRemoveModal.bind(this)
    this.handleCloseUseModal = this.handleCloseUseModal.bind(this)
    this.handleCloseRemoveModal = this.handleCloseRemoveModal.bind(this)
    this.handleOpenPrintCart = this.handleOpenPrintCart.bind(this)
    this.handleXlsxExport = this.handleXlsxExport.bind(this)
    this.modalContent = this.modalContent.bind(this)
  }

  handleOpenUseModal({ useData, cartName }) {
    this.setState({
      isUseModalOpen: true,
      useData: useData,
      cartName: cartName,
    })
  }

  handleOpenRemoveModal({ removeData, cartName }) {
    this.setState({
      isRemoveModalOpen: true,
      removeData: removeData,
      cartName: cartName,
    })
  }

  handleOpenPrintCart({ printData }) {
    this.props.handlePrintCart(printData)
  }

  handleXlsxExport({ cartId }) {
    this.props.handleXlsxExport(cartId)
  }

  handleCloseUseModal() {
    this.setState({
      isUseModalOpen: false,
    })
  }

  handleCloseRemoveModal() {
    this.setState({
      isRemoveModalOpen: false,
    })
  }

  modalContent(action, cartName, handleAction, actionData) {
    return (
      <div className="onda-v1">
        <div style={{ width: '300px' }}></div> {/* minimum modal width */}
        <div className="f5 fw5 mb3"><FormattedMessage id={`cart.${action === 'use' ? 'use.quote' : 'delete.confirm'}`} /> "{cartName}"?</div>
        <p className="f5 fw3"><FormattedMessage id={`cart.${action === 'use' ? 'use.overwrite' : 'delete.warning'}`} /></p>
        <div className="flex justify-around mt5">
          <Button id="vtex-cart-list-no-button" variation="tertiary" onClick={() => {
            action === 'use' ? this.handleCloseUseModal() : this.handleCloseRemoveModal()
          }}>
            <FormattedMessage id="cart.no" />
          </Button>
          <Button id={action === 'use' ? 'vtex-cart-list-confirm-use-button' : 'vtex-cart-list-confirm-remove-button'} variation={action === 'use' ? 'primary' : 'danger'} onClick={() => {
            handleAction(actionData, cartName) // cartName will be logged during cart removal
            action === 'use' ? this.handleCloseUseModal() : this.handleCloseRemoveModal()
          }}><FormattedMessage id={action === 'use' ? 'cart.use.button' : 'cart.remove.confirm'} /></Button>
        </div>
      </div>
    )
  }

  render() {
    const { handleRemoveCart, handleUseCart, cartLifeSpan, carts, enabledLoading } = this.props
    const { isRemoveModalOpen, isUseModalOpen, useData, removeData, cartName } = this.state

    const items = formatCartList(carts, cartLifeSpan)
    return (
      <div className="onda-v1">
        {items.length > 0
          ? <Table
            schema={
              itemSchema({
                openUseModal: this.handleOpenUseModal,
                openRemoveModal: this.handleOpenRemoveModal,
                printCart: this.handleOpenPrintCart,
                exportXlsx: this.handleXlsxExport
              }
            )}
            items={items}
          />
          : !enabledLoading
            ? <EmptyState>
              <p>
                <FormattedMessage id="list.empty" />
              </p>
            </EmptyState>
            : null
        }
        <Modal
          centered
          isOpen={isUseModalOpen}
          onClose={this.handleCloseUseModal}>
          {this.modalContent('use', cartName, handleUseCart, useData)}
        </Modal>
        <Modal
          centered
          isOpen={isRemoveModalOpen}
          onClose={this.handleCloseRemoveModal}>
          {this.modalContent('remove', cartName, handleRemoveCart, removeData)}
        </Modal>
      </div>
    )
  }
}

ListCart.propTypes = {
  handleRemoveCart: PropTypes.func,
  handleUseCart: PropTypes.func,
  handlePrintCart: PropTypes.func,
  handleXlsxExport: PropTypes.func,
  carts: PropTypes.array,
  cartLifeSpan: PropTypes.number,
  enabledLoading: PropTypes.bool,
  useData: PropTypes.arrayOf(PropTypes.object),
  removeData: PropTypes.string,
}

export default ListCart
