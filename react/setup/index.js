import gql from 'graphql-tag'
import { compose, graphql } from 'react-apollo'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Title from './Title'
import Typekit from './Typekit'
import AccountForm from './AccountForm'

import query from './query.gql'
import saveMerchantMutation from './saveMerchantMutation.gql'

class SaveCartSetup extends Component {
  constructor(props) {
    super(props)
    this.state = {
      error: '',
      savedMerchantInfo: null,
      merchantInfo: null
    }

    this.saveAppSettings = this.saveAppSettings.bind(this)
    this.handleFormSubmit = this.handleFormSubmit.bind(this)
    this.handleSaveMerchantError = this.handleSaveMerchantError.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    const { merchantInfo } = nextProps.data
    if (!this.state.merchantInfo && merchantInfo) {
      this.setState({
        merchantInfo,
        savedMerchantInfo: merchantInfo
      })
    }
  }

  /**
   * Envia os dados do merchant para o service através do GRAPHQL
   * 
   * @param {*} merchantInfo Dados do merchant
   */
  handleFormSubmit(merchantInfo) {
    const { saveMerchantMutation, updateMerchantMutation } = this.props
    const merchant = this.createFullMerchantInfo({ ...merchantInfo })

    this.setState({ error: '' }, () => {
      return saveMerchantMutation({ variables: { merchant } })
        .then(this.saveAppSettings)
        .catch(this.handleSaveMerchantError)
    })
  }

  /**
   * Instala ou atualiza a APP na loja
   */
  saveAppSettings() {
    if (parent) {
      const editing = this.isEditing()
      const message = {
        configuration: {
          action: {
            type: editing ? 'edit' : 'install'
          }
        }
      }
      this.props.onSave(message)
    }
  }

  /**
   * Extrai a mensagem de erro do objeto error
   * 
   * @param {*} error Error
   */
  handleSaveMerchantError(error) {
    const { networkError } = error
    if (networkError || networkError.response) {

      return networkError.response.json().then(data => {
        if (data[0].errors[0].message) {
          const { ErrorText } = data[0].errors[0].message

          return this.setState({ error: ErrorText })
        }
        else {
          throw error
        }
      })
    }

    throw error
  }

  /**
   * Cria um objeto com os dados do merchant
   * 
   * @param {*} data Dados do merchant 
   */
  createFullMerchantInfo(data) {
    return {
      primaryButtonName: data.primaryButtonName,
      primaryCartQuantity: data.primaryCartQuantity,
      editing: this.isEditing()
    }
  }

  /**
   * Verifica se os dados estão em edição
   */
  isEditing() {
    const { savedMerchantInfo: {
      primaryButtonName,
      primaryCartQuantity,
      },
    } = this.state
    return !!(primaryButtonName || primaryCartQuantity)
  }

  render() {
    const {
      error,
      merchantInfo
    } = this.state
    if (!merchantInfo) {
      return null
    }
    const {
      primaryButtonName,
      primaryCartQuantity,
    } = merchantInfo
    const editing = this.isEditing()
    const title = `${editing ? 'Update' : 'Create'} account`
    return (
      <div className="font-display dark-gray flex flex-wrap justify-center">
        {
          error && error.length > 0
            ? (
              <div className="w-100 pt3">
                <div className="w-50-ns center br2 pv3 ph3 bg-washed-red red">
                  {error}
                </div>
              </div>
            )
            :
            null
        }

        <div className="w-100">
          <div className="w-50-ns center">
            <Typekit />
            <div className="pl3">
              <Title>{title}</Title>
            </div>
            <div>
              <AccountForm
                editing={editing}
                buttonName={primaryButtonName}
                cartQuantity={primaryCartQuantity}
                onSubmit={this.handleFormSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

SaveCartSetup.propTypes = {
  data: PropTypes.object,
  saveMerchantMutation: PropTypes.func,
  saveAppSettingsMutation: PropTypes.func,
  onSave: PropTypes.func,
}

SaveCartSetup.contextTypes = {
  getSettings: PropTypes.func,
}

export default compose(
  graphql(query),
  graphql(saveMerchantMutation, { name: 'saveMerchantMutation' })
)(SaveCartSetup)
