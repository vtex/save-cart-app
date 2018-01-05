import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Input from './Input'
import Label from './Label'
import Button from './Button'
import SelectBox from './SelectBox'
import FormGroup from './FormGroup'
import ValidationMessages from './ValidationMessages'
import { capitalize, validate, debounce } from './utils'
import {
  buttonNameValidation
} from './validationFields'

class AccountForm extends Component {
  constructor(props) {
    super(props)
    const { buttonName, cartQuantity } = props
    this.state = {
      errors: {
        byId: {
          buttonName: []
        },
        allIds: [
          'buttonName'
        ],
      },
      merchantInfo: {
        byId: {
          primaryButtonName: buttonName,
          primaryCartQuantity: cartQuantity,
        },
        allIds: [
          'primaryButtonName',
          'primaryCartQuantity',
        ],
      },
    }
    this.handleClick = this.handleClick.bind(this)
    this.updateEntry = this.updateEntry.bind(this)
    this.checkBlankFields = this.checkBlankFields.bind(this)

    this.handleButtonName = this.handleButtonName.bind(this)
    this.handleCartQuantity = this.handleCartQuantity.bind(this)

    this.updateError = debounce(this.updateError.bind(this), 500)
    this.checkValidationErrors = this.checkValidationErrors.bind(this)
  }

  handleButtonName({ target: { id, value } }) {
    const errors = validate(buttonNameValidation, value.trim())
    this.updateEntry('primaryButtonName', value)
    this.updateError(id, errors)
  }

  handleCartQuantity({ target: { id, value } }) {    
    this.updateEntry('primaryCartQuantity', value)
  }

  handleClick() {
    this.props.onSubmit(this.state.merchantInfo.byId)
  }

  updateEntry(key, value) {
    this.setState(({ merchantInfo: { byId, allIds } }) => {
      return {
        merchantInfo: {
          allIds,
          byId: {
            ...byId,
            [key]: value,
          },
        },
      }
    })
  }

  updateError(id, value) {
    const key = id
      .split('-')
      .map((s, i) => i > 0 ? capitalize(s) : s)
      .join('')
    this.setState(({ errors: { byId, allIds } }) => {
      return {
        errors: {
          allIds,
          byId: {
            ...byId,
            [key]: value,
          },
        },
      }
    })
  }

  checkValidationErrors() {
    const { errors: { byId, allIds } } = this.state
    return allIds.reduce((acc, id) => (acc || byId[id].length > 0), false)
  }

  checkBlankFields() {
    const { merchantInfo: { byId, allIds } } = this.state
    return allIds.reduce((acc, id) => (acc || !byId[id]), false)
  }

  render() {
    const {
      errors: {
        byId: {
          buttonName
        },
      },
      merchantInfo: {
        byId: {
          primaryButtonName,
          primaryCartQuantity
        },
      },
    } = this.state

    const { editing } = this.props
    const hasError = this.checkBlankFields() || this.checkValidationErrors()
    return (
      <div className="ph3 pl3-ns">
        <div>
          <div className="dib pr4-ns mr4-ns mt4-ns">

            <FormGroup>
              <Label htmlFor="button-name">
                Button Name
              </Label>
              <Input
                type="text"
                id="button-name"
                value={primaryButtonName || ''}
                invalid={buttonName.length > 0}
                onChange={this.handleButtonName}
              />
              <ValidationMessages messages={buttonName} />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="cart-quantity">
                Cart Quantity
              </Label>
              <SelectBox
                id="button-name"
                value={primaryCartQuantity || ''}
                options={['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']}
                onChange={this.handleCartQuantity}
              />
            </FormGroup>

            <FormGroup>
              <Button
                disabled={hasError}
                onClick={this.handleClick}
              >
                {editing ? 'Update' : 'Save'}
              </Button>
            </FormGroup>
          </div>
        </div>
      </div>
    )
  }
}

AccountForm.defaultProps = {
  editing: false,
  onSubmit: () => { },
  buttonName: '',
  cartQuantity: ''
}

AccountForm.propTypes = {
  editing: PropTypes.bool,
  onSubmit: PropTypes.func,
  buttonName: PropTypes.string,
  cartQuantity: PropTypes.string
}

export default AccountForm