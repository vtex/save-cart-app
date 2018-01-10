import getCountryISO2 from '../utils/countryISOMapping'
import { getAddress } from '../utils/addressMapping'
import { map, prop } from 'ramda'
import http from 'axios'

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

  const expectedOrderFormSections = ['items', 'customData', 'clientProfileData', 'paymentData', 'marketingData', 'storePreferencesData']

  return {
    /**
     * Inclui os dados de marketing no orderForm
     * 
     * @param {string} orderFormId Identificador do orderForm
     * @param {any} marketingData Dados do marketing
     */
    saveMarketingData: (orderFormId: string, marketingData: any, cookie: string) => {
      const url = routes.marketingData(account, orderFormId)
      const headers = {
        Accept: 'application/json',
        Authorization: `bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Accept-Encoding': 'gzip, deflate',
        Cookie: cookie
      }

      console.log(JSON.stringify(headers, null, 2))

      return http.post(url, { ...marketingData, expectedOrderFormSections }, { headers, withCredentials: true }).then(prop('data'))
    },
    //Atualiza os dados do order hook
    updateOrderHook: (orderFormId: string, hook: any) => {
      const url = routes.orderFormHooks(account, orderFormId)
      return http.post(url, hook, { headers }).then(prop('data'))
    },
    //Salva os dados customizados
    saveCustomData: (orderFormId: string, field: string, value: any) => {
      const url = routes.orderFormCustomData(account, orderFormId, 'masterpass', field)
      const strValue = typeof value === 'string' ? value : JSON.stringify(value)
      return http.put(url, { value: strValue, expectedOrderFormSections }, { headers }).then(prop('data'))
    },
    //Seta no order form que o profile é ignorado
    setIgnoreProfile: (orderFormId: string, ignoreProfileData: boolean) => {
      const url = routes.orderFormIgnoreProfile(account, orderFormId)
      return http.patch(url, { ignoreProfileData, expectedOrderFormSections }, { headers }).then(prop('data'))
    },
    //Atualiza o order form com os dados do usuário
    updateOrderFormProfile: (orderFormId: string, personalInfo: PersonalInfo): PromiseLike<any> => {
      const url = routes.orderFormProfile(account, orderFormId)
      const fullName = personalInfo.fullName.split(' ')
      let firstName = fullName[0]
      let lastName = ''

      if (fullName.length > 1) { lastName = fullName[1] }

      const payload = {
        expectedOrderFormSections,
        email: personalInfo.recipientEmailAddress,
        document: personalInfo.nationalId,
        documentType: 'cpf',
        firstName: firstName,
        lastName: lastName,
        phone: personalInfo.recipientPhone,
        isCorporate: false,
      }

      return http.post(url, payload, { headers }).then(prop('data'))
    },
    //Atualiza os dados de entrega do usuário
    updateShipping: (orderFormId: string, addr: Address, receiverName: string) => {
      const url = routes.orderFormShipping(account, orderFormId)
      const payload = {
        expectedOrderFormSections,
        orderFormId,
        address: {
          addressType: 'residential',
          postalCode: addr.postalCode,
          country: getCountryISO2(addr.country),
          receiverName: receiverName,
          city: addr.city,
          state: addr.subdivision,
          street: addr.line5,
          number: addr.line4,
          complement: addr.line2,
          neighborhood: addr.line3,
        },
      }
      return http.post(url, payload, { headers }).then(prop('data'))
    },
    /**
     * Obtém o orderForm pelo identificador
     *
     * @param orderFormId Identificador do orderForm
     */
    getOrderForm: (orderFormId: string, cookie: string): any => {
      const url = routes.orderFormId(account, orderFormId)
      const payload = { expectedOrderFormSections }
      const headers = {
        Accept: 'application/json',
        Authorization: `bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Accept-Encoding': 'gzip, deflate',
        Cookie: cookie
      }
      return http.post(url, payload, { headers, withCredentials: true }).then(prop('data'))
    },
    getBlankOrderForm: (): any => {
      const url = routes.orderForm(account)
      const payload = { expectedOrderFormSections }
      const headers = {
        Accept: 'application/json',
        Authorization: `bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
      return http.post(url, payload, { headers }).then(prop('data'))
    }

  }
}
