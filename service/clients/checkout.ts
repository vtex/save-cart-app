import getCountryISO2 from '../utils/countryISOMapping'
import { getAddress } from '../utils/addressMapping'
import { map, prop } from 'ramda'
import axios from 'axios'
var request = require("request")

const routes = {
  orderForm: (account, env = 'stable') => `http://${account}.vtexcommerce${env}.com.br/api/checkout/pub/orderForm`,

  orderFormProfile: (account, orderFormId) => `${routes.orderForm(account)}/${orderFormId}/attachments/clientProfileData?an=${account}`,

  orderFormShipping: (account, orderFormId) => `${routes.orderForm(account)}/${orderFormId}/attachments/shippingData?an=${account}`,

  orderFormPayment: (account, orderFormId) => `${routes.orderForm(account)}/${orderFormId}/attachments/paymentData?an=${account}`,

  orderFormPaymentToken: (account, orderFormId) => `${routes.orderForm(account)}/${orderFormId}/paymentData/paymentToken?an=${account}`,

  orderFormPaymentTokenId: (account, orderFormId, tokenId) => `${routes.orderForm(account)}/${orderFormId}/paymentData/paymentToken/${tokenId}?an=${account}`,

  orderFormIgnoreProfile: (account, orderFormId) => `${routes.orderForm(account)}/${orderFormId}/profile?an=${account}`,

  orderFormCustomData: (account, orderFormId, appId, field) => `${routes.orderForm(account)}/${orderFormId}/customData/${appId}/${field}?an=${account}`,

  marketingData: (account, orderFormId) => `${routes.orderForm(account)}/${orderFormId}/attachments/marketingData?an=${account}`,

  addItem: (account, orderFormId) => `${routes.orderForm(account)}/${orderFormId}/items?an=${account}`,

  updateItems: (account, data) => `${routes.addItem(account, data)}/update?an=${account}`,

  orderFormHooks: (account, orderFormId) => `${routes.orderForm(account)}/${orderFormId}/hooksData?an=${account}`,

  orderFormId: (account, orderFormId) => `${routes.orderForm(account)}/${orderFormId}`
}

/**
 * Exporta as funções que serão utilizadas para atualizar os dados do orderForm
 */
export default ({ account, authToken }: ReqContext) => {
  const headers = {
    Authorization: `bearer ${authToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  const expectedOrderFormSections = ['items', 'customData', 'clientProfileData', 'paymentData', 'marketingData']

  return {
    /**
     * Inclui os dados de marketing no orderForm
     *
     * @param orderFormId Identificador do orderForm
     * @param marketingData Dados do marketing
     */
    saveMarketingData: (orderFormId: string, marketingData: any) => {
      const url = routes.marketingData(account, orderFormId)
      return axios.post(url, { ...marketingData, expectedOrderFormSections }, { headers }).then(prop('data'))
    },
    /**
     * Atualiza os dados do hook para o orderForm
     *
     * @param orderFormId Identificador do orderForm
     * @param hook Dados do hook
     */
    updateOrderHook: (orderFormId: string, hook: any) => {
      const url = routes.orderFormHooks(account, orderFormId)
      return axios.post(url, hook, { headers }).then(prop('data'))
    },
    //Seta o tipo de pagamento no order form
    setOrderFormPaymentType: (orderFormId: string, orderTotal: number, tokens: PaymentTokenResponse[]) => {
      const url = routes.orderFormPayment(account, orderFormId)
      const payments = map(({ bin, paymentSystem, token }) => ({ paymentSystem, bin, tokenId: token, referenceValue: orderTotal }), tokens)

      return axios.post(url, { payments, expectedOrderFormSections }, { headers }).then(prop('data'))
    },
    //Salva os dados customizados
    saveCustomData: (orderFormId: string, field: string, value: any) => {
      const url = routes.orderFormCustomData(account, orderFormId, 'save-cart', field)
      const strValue = typeof value === 'string' ? value : JSON.stringify(value)
      return axios.put(url, { value: strValue, expectedOrderFormSections }, { headers }).then(prop('data'))
    },
    //Seta no order form que o profile é ignorado
    setIgnoreProfile: (orderFormId: string, ignoreProfileData: boolean) => {
      const url = routes.orderFormIgnoreProfile(account, orderFormId)
      return axios.patch(url, { ignoreProfileData, expectedOrderFormSections }, { headers }).then(prop('data'))
    },
    /**
     * Atualiza o orderForm com os dados de identificação do usuário
     *
     * @param orderFormId Identificador do orderForm
     * @param personalInfo Dados de identificação do usuário
     */
    updateOrderFormProfile: (orderFormId: string, personalInfo: PersonalInfo): PromiseLike<any> => {
      const url = routes.orderFormProfile(account, orderFormId)
      const fullName = personalInfo.fullName.split(' ')
      let firstName = fullName[0]
      let lastName = ''

      if (fullName.length > 1) { lastName = fullName[1] }

      const payload = {
        expectedOrderFormSections,
        email: personalInfo.recipientEmailAddress,
        document: personalInfo.nationalId && personalInfo.nationalId != null && personalInfo.nationalId != 'null' ? personalInfo.nationalId : '',
        documentType: '',
        firstName: firstName,
        lastName: lastName,
        phone: personalInfo.recipientPhone,
        isCorporate: false,
      }
      return axios.post(url, payload, { headers }).then(prop('data'))
    },
    /**
     * Atualiza o orderForm com os dados de entrega do usuário
     *
     * @param orderFormId Identificador do orderForm
     * @param addr Dados de entrega do usuário
     * @param receiverName Nome da pessoa que irá receber a entrega
     */
    updateShipping: (orderFormId: string, addr: Address, receiverName: string) => {
      const url = routes.orderFormShipping(account, orderFormId)

      const testFields = addr.line5 && addr.line5 != null && addr.line5 != 'null' && addr.line4 && addr.line4 != null && addr.line4 != 'null'
      let street = testFields ? addr.line5 : addr.line1
      street = street.replace('–', '-')
      const number = testFields ? addr.line4 : ''
      const state = addr.subdivision.substring(addr.subdivision.indexOf('-') + 1, addr.subdivision.length)
      const postalCode = addr.postalCode && addr.postalCode != null && addr.postalCode != 'null' ? addr.postalCode : ''
      const country = getCountryISO2(addr.country)
      const addressMapping = getAddress(state, addr.city, postalCode, country)

      const payload = {
        expectedOrderFormSections,
        orderFormId,
        address: {
          addressType: 'residential',
          postalCode: addressMapping.postalCode,
          country: country,
          receiverName: receiverName,
          city: addressMapping.city,
          state: addressMapping.state,
          street: street,
          number: number,
          complement: addr.line2,
          neighborhood: addr.line3 && addr.line3 != null && addr.line3 != 'null' ? addr.line3 : '',
        },
        clearAddressIfPostalCodeNotFound: false
      }
      return axios.post(url, payload, { headers }).then(prop('data'))
    },
    /**
     * Adiciona ao orderForm os dados de pagamento criptografados
     *
     * @param orderFormId Identificador do orderForm
     * @param token Token que identifica o cartão
     * @param bin Primeiros dígitos do cartão
     * @param paymentSystem Sistema de pagamento
     * @param paymentSystemName Nome do Sistema de pagamento
     * @param lastDigits Últimos dígitos do cartão
     */
    addOrderFormPaymentToken: (orderFormId: string, { token, bin, paymentSystem, paymentSystemName, lastDigits }: PaymentTokenResponse): any => {
      const url = routes.orderFormPaymentToken(account, orderFormId)
      const payload = {
        expectedOrderFormSections,
        paymentToken: {
          tokenId: token,
          cardNumber: `************${lastDigits}`,
          bin,
          paymentSystem,
          paymentSystemName,
        },
      }
      return axios.put(url, payload, { headers }).then(prop('data'))
    },
    /**
     * Remove os dados de pagamentos do orderForm
     *
     * @param orderFormId Identificador do orderForm
     * @param token Token que identifica o cartão
     */
    removeOrderFormPaymentToken: (orderFormId: string, tokenId: string) => {
      const url = routes.orderFormPaymentTokenId(account, orderFormId, tokenId)
      return axios.delete(url, { headers, data: { expectedOrderFormSections } })
    },
    /**
     * Obtém o orderForm pelo identificador
     *
     * @param orderFormId Identificador do orderForm
     */
    getOrderForm: (orderFormId: string, cookie: string): any => {
      const url = routes.orderFormId(account, orderFormId)
      const expectedOrderFormSections = ['items', 'totalizers', 'storePreferencesData']
      const payload = { expectedOrderFormSections }
      const headers = {
        Accept: 'application/json',
        Authorization: `bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Cookie: cookie
      }
      return axios.post(url, payload, { headers }).then(prop('data'))
    }
  }
}
