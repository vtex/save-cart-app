import { Apps } from '@vtex/api'
import http from 'axios'

const appMajor = '0'

const getAppId = () => {
  return `vtex.savecart@${appMajor}.x`
}

const routes = {
  saveCart: (account) => `http://${account}.vtexcommercestable.com.br/api/dataentities/cart/documents`,
  listCarts: (account, email) => `http://${account}.vtexcommercestable.com.br/api/dataentities/cart/search?email=${email}&_schema=v4&_fields=id,email,cartName,items,creationDate`,
  removeCart: (account, id) => `http://${account}.vtexcommercestable.com.br/api/dataentities/cart/documents/${id}`,
}

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
      console.log('saveCart')
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.vtex.ds.v10+json',
        'VtexIdclientAutCookie': ctx.vtex.authToken,
        'Proxy-Authorization': ctx.vtex.authToken
      }
      const url = routes.saveCart(ctx.vtex.account)
      const { data } = await http({
        method: 'post',
        url,
        data: params.cart,
        headers
      })
      if (data.Id) {
        return data.Id
      }
    },
    getCarts: async (_, params, ctx) => {
      console.log('getCarts')
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.vtex.ds.v10+json',
        'REST-Range': `resources=0-100`,
        'VtexIdclientAutCookie': ctx.vtex.authToken,
        'Proxy-Authorization': ctx.vtex.authToken
      }
      const url = routes.listCarts(ctx.vtex.account, encodeURIComponent(params.email))
      console.log('url', url)
      const { data } = await http({
        method: 'get',
        url,
        headers
      })
      console.log(data)
      return data
    },
    removeCart: async (_, params, ctx) => {
      console.log('removeCart')
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.vtex.ds.v10+json',
        'VtexIdclientAutCookie': ctx.vtex.authToken,
        'Proxy-Authorization': ctx.vtex.authToken
      }
      const url = routes.removeCart(ctx.vtex.account, params.id)
      const result = await http({
        method: 'delete',
        url,
        headers
      })
      if (result.status === 204){
        return true
      }
      return false
    }
  }
}
