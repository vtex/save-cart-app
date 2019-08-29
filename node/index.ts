import * as json from 'co-body'
import { mapObjIndexed } from 'ramda'
import * as url from 'url'

import { resolvers } from './graphql'

export default {
  routes: {
    ...mapObjIndexed(
      handler => async (ctx: any) => {
        try {
          ctx.body = await handler({}, ctx.vtex.route.params, ctx)
          ctx.status = 200
        } catch (e) {
          ctx.body = e
          ctx.status = 500
        }
      },
      {
        ...resolvers.Query,
        getCarts: resolvers.Mutation.getCarts
      }
    ),
    saveCart: async (ctx: any) => {
      try {
        ctx.body = await resolvers.Mutation.saveCart({}, {
          cart: await json(ctx.req)
        }, ctx)
        ctx.status = 200
      } catch (e) {
        ctx.body = e
        ctx.status = 500
      }
    },
    removeCart: async (ctx: any) => {
      try {
        const { cartName, expired } = await json(ctx.req)
        const { id } = ctx.vtex.route.params

        ctx.body = await resolvers.Mutation.removeCart({}, {
          cartName,
          expired,
          id
        }, ctx)
        ctx.status = 200
      } catch (e) {
        ctx.body = e
        ctx.status = 500
      }
    },
    useCart: async (ctx: any) => {
      try {
        const { orderFormId } = url.parse(ctx.request.url, true).query
        const { items, userType } = await json(ctx.req)

        ctx.body = await resolvers.Mutation.useCart({}, {
          items,
          userType,
          orderFormId,
        }, ctx)
        ctx.status = 200
      } catch (e) {
        ctx.body = e
        ctx.status = 500
      }
    },
  }
}
