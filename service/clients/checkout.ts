import getCountryISO2 from '../utils/countryISOMapping'
import { getAddress } from '../utils/addressMapping'
import { map, prop } from 'ramda'
import axios from 'axios'

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
        'Accept-Encoding': 'gzip, deflate',
        Cookie: cookie
      }
      return axios.post(url, payload, { headers, withCredentials: true }).then(prop('data'))
    }
  }
}
