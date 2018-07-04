import { Apps } from '@vtex/api'
import http from 'axios'

const appMajor = "0"

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
  },
  Mutation: {
    saveCart: async (_, params, ctx) => {
      console.log('saveCart')
      console.log(params)
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.vtex.ds.v10+json',
        'authorization': `bearer ${ctx.vtex.authToken}`
      }
      const url = routes.saveCart(ctx.vtex.account)
      await http({
        method: 'post',
        url: url,
        data: params.cart,
        headers: headers
      })
      return true
    },
    getCarts: async (_, params, ctx) => {
      console.log('getCarts')
      console.log(params)
      console.log(ctx.request.headers['x-vtex-credential'])
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.vtex.ds.v10+json',
        'REST-Range': 'resources=0-202',
        'authorization': `bearer ${ctx.vtex.authToken}`
      }
      const url = routes.listCarts(ctx.vtex.account, params.email)
      const { data } = await http({
        method: 'get',
        url: url,
        headers: headers
      })
      return data
    },
    removeCart: async (_, params, ctx) => {
      console.log('removeCart')
      console.log(params)
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.vtex.ds.v10+json',
        'authorization': `bearer ${ctx.vtex.authToken}`
      }
      const url = routes.removeCart(ctx.vtex.account, params.id)
      const { data } = await http({
        method: 'delete',
        url: url,
        headers: headers
      })
      console.log(data)
      return true
    }
  }
}
