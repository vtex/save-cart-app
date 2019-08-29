import * as json from 'co-body'
import { mapObjIndexed } from 'ramda'

import { resolvers } from './graphql'

const setDefaultHeaders = (ctx: any) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS')
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, authorization')
  ctx.set('Cache-Control', 'no-cache')
}

export default {
  routes: {
    ...mapObjIndexed(
      handler => async (ctx: any) => {
        try {
          setDefaultHeaders(ctx)
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
      setDefaultHeaders(ctx)
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
      setDefaultHeaders(ctx)
      try {
        const { cartName, expired } = await json(ctx.req)
        const { cartId: id } = ctx.vtex.route.params

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
      setDefaultHeaders(ctx)
      try {
        const { items, userType } = await json(ctx.req)
        const { orderFormId } = ctx.vtex.route.params

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
