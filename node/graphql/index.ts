import { Apps } from '@vtex/api'
import http from 'axios'
import * as jwt from 'jsonwebtoken'
import colossus from '../resources/colossus'
import {errorResponse} from '../utils/error'

const appMajor = '0'

const getAppId = () => {
  return `vtex.savecart@${appMajor}.x`
}

const routes = {
  saveCart: (account) => `http://${account}.vtexcommercestable.com.br/api/dataentities/cart/documents`,
  listCarts: (account, email) => `http://${account}.vtexcommercestable.com.br/api/dataentities/cart/search?email=${email}&_schema=v4&_fields=id,email,cartName,items,creationDate`,
  removeCart: (account, id) => `http://${account}.vtexcommercestable.com.br/api/dataentities/cart/documents/${id}`,
}

const defaultHeaders = (authToken) => ({
  'Content-Type': 'application/json',
  'Accept': 'application/vnd.vtex.ds.v10+json',
  'VtexIdclientAutCookie': authToken,
  'Proxy-Authorization': authToken
})

export const resolvers = {
  Query: {
    getSetupConfig: async (_, __, ctx) => {
      const apps = new Apps(ctx.vtex)
      const filter = getAppId()
      return apps.getAppSettings(filter).then((r) => (r))
    },
    currentTime: async (_, __, ___) => {
      return new Date().toISOString()
    }
  },
  Mutation: {
    saveCart: async (_, params, ctx) => {
      const { vtex: ioContext } = ctx
      const {account, authToken} = ioContext
      const token = ctx.cookies.get(`VtexIdclientAutCookie_${account}`)
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
        const {status, body, details} = errorResponse(e)
        logger.log('CartSaveError', 'error', {cart: params.cart, user, status, body, details})
        throw {status, body, details}
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
        logger.log('CartListSuccess', 'info', {user: params.email})
        return data
      } catch (e) {
        const {status, body, details} = errorResponse(e)
        logger.log('CartListError', 'error', {user: params.email, status, body, details})
        throw {status, body, details}
      }
    },

    removeCart: async (_, params, ctx) => {
      const {vtex: ioContext} = ctx
      const {account, authToken} = ioContext
      const token = ctx.cookies.get(`VtexIdclientAutCookie_${account}`)
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
          logger.log('CartRemoveSuccess', 'info', {cartName: params.cartName, cartId: params.id, user})
          return true
        }
      } catch (e) {
        const {status, body, details} = errorResponse(e)
        logger.log('CartRemoveError', 'error', {cartName: params.cartName, cartId: params.id, user, status, body, details})
        throw {status, body, details}
      }
    }
  }
}
