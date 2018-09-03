import { Apps } from '@vtex/api'
import http from 'axios'
import * as jwt from 'jsonwebtoken'
import colossus from '../resources/colossus'
import {errorResponse} from '../utils/error'
import GraphQLError from '../utils/GraphQLError'

const getAppId = () => {
  return process.env.VTEX_APP_ID
}

const routes = {
  saveCart: (account) => `http://${account}.vtexcommercestable.com.br/api/dataentities/cart/documents`,
  listCarts: (account, email) => `http://${account}.vtexcommercestable.com.br/api/dataentities/cart/search?email=${email}&_schema=v5&_fields=id,email,cartName,items,creationDate`,
  removeCart: (account, id) => `http://${account}.vtexcommercestable.com.br/api/dataentities/cart/documents/${id}`,
  saveSchema: (account) => `http://${account}.vtexcommercestable.com.br/api/dataentities/cart/schemas/v5`,
  clearCart: (account, id) => `http://${account}.vtexcommercestable.com.br/api/checkout/pub/orderForm/${id}/items/removeAll`,
  addToCart: (account, orderFormId) => `http://${account}.vtexcommercestable.com.br/api/checkout/pub/orderForm/${orderFormId}/items/`,
  addPriceToItems: (account, orderFormId, key) => `http://${account}.vtexcommercestable.com.br/api/checkout/pub/orderForm/${orderFormId}/items/${key}/price`
}

const schema = `{
  "properties": {
  "email": { "type": "string", "title":"Email" },
  "cartName": { "type": "string", "title":"Cart Name" },
  "items": { "type": "array", "title":"Cart" },
  "creationDate": { "type": "string", "title":"Creation Date" },
  "cartLifeSpan": { "type": "string", "title":"Cart Life Span" }
  },
  "v-indexed": [ "email", "creationDate", "cartLifeSpan", "cartName" ],
  "v-default-fields": [ "email", "cart", "creationDate", "cartLifeSpan" ],
  "v-cache": false
  }`

const defaultHeaders = (authToken) => ({
  'Content-Type': 'application/json',
  'Accept': 'application/vnd.vtex.ds.v10+json',
  'VtexIdclientAutCookie': authToken,
  'Proxy-Authorization': authToken
})

export const resolvers = {
  Query: {
    getSetupConfig: async (_, __, ctx) => {
      const {vtex: {account, authToken}} = ctx
      const apps = new Apps(ctx.vtex)
      const app = getAppId()
      const settings = await apps.getAppSettings(app)
      if (settings.adminSetup && !settings.adminSetup.hasSchema) {
        try {
          console.log('Starting to put schema in MD')
          const url = routes.saveSchema(account)
          const headers = defaultHeaders(authToken)
          await http({
            method: 'PUT',
            url,
            data: schema,
            headers,
            validateStatus: status => (status >= 200 && status < 300) || status === 304,
          })
          console.log('Schema saved successfully. Updating app settings')
          settings.adminSetup.hasSchema = true
          await apps.saveAppSettings(app, settings)
        } catch (e) {
          console.log('PutSchemaResponseError: ', e)
          settings.adminSetup.hasSchema = false
          await apps.saveAppSettings(app, settings)
        }
      }
      return settings
    },
    currentTime: async (_, __, ___) => {
      return new Date().toISOString()
    }
  },
  Mutation: {
    useCart: async (_, params, ctx) => {
      const {vtex: ioContext} = ctx
      const {account, authToken} = ioContext
      const logger = colossus(ioContext)
      const token = ctx.cookies.get(`VtexIdclientAutCookie_${account}`) || ctx.cookies.get(`VtexIdclientAutCookie`)
      const useHeaders =  {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'VtexIdclientAutCookie': token,
        'Proxy-Authorization': authToken
      }
      try {
        // CLEAR CURRENT CART
        await http({
        method: 'post',
        url: routes.clearCart(account, params.orderFormId),
        data: {'expectedOrderFormSections': ['items'],},
        headers: useHeaders,
        })
        // ADD ITEMS TO CART
        await http({
          url: routes.addToCart(account, params.orderFormId),
          method: 'post',
          data: {
            'expectedOrderFormSections': ['items'],
            'orderItems': params.items.map((item) => {
              return {
                id: item.id,
                quantity: item.quantity,
                seller: '1',
              }
            }),
          },
          headers: useHeaders,
        })
        // IF CALLCENTER OPERATOR, SAVE PRICES
        if (params.userType === 'callCenterOperator') {
          const priceRequests = []
          params.items.forEach((item, key) => {
          priceRequests.push(http({
            url: routes.addPriceToItems(account, params.orderFormId, key),
            method: 'put',
            data: {
              'price': item.sellingPrice,
            },
            headers: useHeaders,
          }))
        })
        await http.all(priceRequests)
        }
      } catch (e) {
        console.log(e)
        const {status, body, details} = errorResponse(e)
        logger.log('CartUseError', 'error', {orderFormId: params.orderFormId, status, body, details})
        if (e.message) {
          throw new GraphQLError(e.message)
        } else if (e.response && e.response.data && e.response.data.message) {
          throw new GraphQLError(e.response.data.message)
        }
        throw e as GraphQLError
      }
    },
    saveCart: async (_, params, ctx) => {
      const { vtex: ioContext } = ctx
      const {account, authToken} = ioContext
      const token = ctx.cookies.get(`VtexIdclientAutCookie_${account}`) || ctx.cookies.get(`VtexIdclientAutCookie`)
      const user: string = jwt.decode(token).sub
      const logger = colossus(ioContext)
      const headers = defaultHeaders(authToken)
      const url = routes.saveCart(account)
      try {
        const { data } = await http({
          method: 'post',
          url,
          data: params.cart,
          headers
        })
        logger.log('CartSaveSuccess', 'info', {cart: params.cart, cartId: data.Id})
        return data.Id
      } catch (e) {
        console.log(e)
        const {status, body, details} = errorResponse(e)
        logger.log('CartSaveError', 'error', {cart: params.cart, user, status, body, details})
        if (e.message) {
          throw new GraphQLError(e.message)
        } else if (e.response && e.response.data && e.response.data.message) {
          throw new GraphQLError(e.response.data.message)
        }
        throw e as GraphQLError
      }
    },

    getCarts: async (_, params, ctx) => {
      const {vtex: ioContext} = ctx
      const {account, authToken} = ioContext
      const logger = colossus(ioContext)
      const headers = {
        ...defaultHeaders(authToken),
        'REST-Range': `resources=0-100`,
      }
      const url = routes.listCarts(account, encodeURIComponent(params.email))
      try {
        const { data } = await http({
          method: 'get',
          url,
          headers
        })
        return data
      } catch (e) {
        console.log(e)
        const {status, body, details} = errorResponse(e)
        logger.log('CartListError', 'error', {user: params.email, status, body, details})
        if (e.message) {
          throw new GraphQLError(e.message)
        } else if (e.response && e.response.data && e.response.data.message) {
          throw new GraphQLError(e.response.data.message)
        }
        throw e as GraphQLError
      }
    },

    removeCart: async (_, params, ctx) => {
      const {vtex: ioContext} = ctx
      const {account, authToken} = ioContext
      const token = ctx.cookies.get(`VtexIdclientAutCookie_${account}`) || ctx.cookies.get(`VtexIdclientAutCookie`)
      const user: string = jwt.decode(token).sub
      const logger = colossus(ioContext)
      const headers = defaultHeaders(authToken)
      const url = routes.removeCart(account, params.id)
      try {
        const result = await http({
          method: 'delete',
          url,
          headers
        })
        if (result.status === 204){
          logger.log('CartRemoveSuccess', 'info', {cartName: params.cartName, cartId: params.id, user, expired: params.expired})
          return true
        }
      } catch (e) {
        console.log(e)
        const {status, body, details} = errorResponse(e)
        logger.log('CartRemoveError', 'error', {cartName: params.cartName, cartId: params.id, user, expired: params.expired, status, body, details})
        if (e.message) {
          throw new GraphQLError(e.message)
        } else if (e.response && e.response.data && e.response.data.message) {
          throw new GraphQLError(e.response.data.message)
        }
        throw e as GraphQLError
      }
    }
  }
}
