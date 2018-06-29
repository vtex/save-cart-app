import { Apps } from '@vtex/api'
import http from 'axios'
import { map, prop } from 'ramda'

const appMajor = process.env.VTEX_APP_VERSION.split('.')[0]

const getAppId = () => {
  return `vtex.savecart@${appMajor}.x`
}


const routes = {
  saveCart: (account) => `http://${account}.vtexcommercestable.com.br/api/dataentities/cart/documents`,
}

export const resolvers = {
  Query: {
    getSetupConfig: async (_, __, ctx) => {
      const apps = new Apps(ctx.vtex)
      const filter = getAppId()
      return apps.getAppSettings(filter).then((r) => (r))
    }
  },
  Mutation: {
    saveCart: async (_, params, ctx) => {

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
      }).then(((data) => {
        console.log(data)
      }))


      return true
    }
  }
}
