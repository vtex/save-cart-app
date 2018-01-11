import colossus from './resources/colossus'
import processPaymentProfile from './pipeline'
import checkoutClient from './clients/checkout'

import { prop } from 'ramda'
import { enableIoExtensions } from './resources/portal'
import { parseQuery } from './utils/url'
import { orderStatus } from './utils/orderStatus'
import { notFound } from './utils/status'
import { VBaseApp, VBaseUser } from './vbase'
import { formatPrice } from './utils/price'

import * as parse from 'co-body'
import fetch from 'node-fetch'

Promise = require('bluebird')
Promise.config({
  warnings: true,
  longStackTraces: true,
})

global['fetch'] = fetch
console.log('App started')

const errorResponse = (err) => {
  if (err.response) {
    const status = err.response.status
    let url = ''
    let method = ''
    let data = ''
    if (err.response.config) {
      url = err.response.config.url
      method = err.response.config.method
      data = err.response.config.data
    }

    const { error, errors, operationId } = err.response.data
    const newError = error ? error : errors

    return { status, body: newError, details: { url, method, data, operationId } }
  }
  return { status: 500, body: err, details: {} }
}

const setDefaultHeaders = (res) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization")
  res.set('Content-Type', 'application/json')
  res.set('Cache-Control', 'no-cache')
}

const createCookie = (orderFormId, vtexIdclientAutCookie) => {
  return `checkout.vtex.com=__ofid=${orderFormId}; ${vtexIdclientAutCookie};`
}

/**
 * Métodos que realizam o processamento de cada endpoint (Os endpoint estão no arquivo service.json).
 * Os nomes das rotas devem ser os mesmo neste arquivo e no service.json, por exemplo: saveMerchantHandler *
 */
export default {
  routes: {
    /**
     * Sava os dados do merchant que vieram da tela de setup no VBase e habilita extensão na loja
     */
    saveMerchantHandler: async (ctx) => {
      const { request: req, response: res, vtex: ioContext } = ctx
      const { account, workspace, authToken } = ioContext
      const logger = colossus(account, workspace, authToken)

      try {
        const { data: { merchant } } = await parse.json(req)
        const vbase = VBaseApp(authToken, account, workspace)

        vbase.saveFile({ ...merchant })

        enableIoExtensions(account, authToken)

        res.status = 200
        res.set('Content-Type', 'application/json')
        res.body = { data: 'OK' }
      } catch (err) {
        const errorMessage = 'Error processing saveMerchant'
        const { status, body, details } = errorResponse(err)

        if (err.response) {
          res.set('Content-Type', 'application/json')
          res.status = status
          res.body = { error: body }
          logger.log(errorMessage, 'error', details)
          return
        }
        logger.log(errorMessage, 'error', { errorMessage: err.message })
        res.body = err
        res.status = status
      }
    },
    /**
     * Obtém os dados do merchant que estão no VBase e devolve para a tela de setup
     */
    merchantInfoHandler: async (ctx) => {
      const { response: res, vtex: ioContext } = ctx
      const { account, workspace, authToken } = ioContext
      const logger = colossus(account, workspace, authToken)

      try {
        const vBase = VBaseApp(authToken, account, workspace)
        const merchantResponse = await vBase.getFile().then(prop('data')).catch(notFound())

        res.status = 200
        res.set('Content-Type', 'application/json')

        if (merchantResponse && Object.keys(merchantResponse).length !== 0) {
          const merchantInfo = JSON.parse(merchantResponse.toString())
          res.body = { data: merchantInfo }
        } else {
          res.body = { data: 'OK' }
        }
      } catch (err) {
        const errorMessage = 'Error processing merchantInfo'
        const { status, body, details } = errorResponse(err)

        if (err.response) {
          res.set('Content-Type', 'application/json')
          res.status = status
          res.body = { error: body }
          logger.log(errorMessage, 'error', details)
          return
        }
        logger.log(errorMessage, 'error', { errorMessage: err.message })
        res.body = err
        res.status = status
      }
    },
    nameSaveCartHandler: async (ctx) => {
      const { response: res, vtex: ioContext } = ctx
      const { account, workspace, authToken } = ioContext
      const logger = colossus(account, workspace, authToken)

      try {
        setDefaultHeaders(res)

        const vbaseApp = VBaseApp(authToken, account, workspace)
        const merchantResponse = await vbaseApp.getFile().then(prop('data')).catch(notFound())

        if (merchantResponse && Object.keys(merchantResponse).length !== 0) {
          const merchantInfo = JSON.parse(merchantResponse.toString())

          res.status = 200
          res.body = merchantInfo.primaryButtonName
        } else {
          res.status = 400
          res.body = { errorMessage: 'O APP não está configurado.' }
        }
      } catch (err) {
        const errorMessage = 'Error list carts'
        const { status, body, details } = errorResponse(err)

        if (err.response) {
          res.set('Content-Type', 'application/json')
          res.status = status
          res.body = { error: body }
          logger.log(errorMessage, 'error', details)
          return
        }
        logger.log(errorMessage, 'error', { errorMessage: err.message })
        res.body = err
        res.status = status
      }
    },
    saveCartHandler: async (ctx) => {
      const { request: req, response: res, vtex: ioContext } = ctx
      const { account, workspace, authToken } = ioContext
      const logger = colossus(account, workspace, authToken)

      try {
        setDefaultHeaders(res)
        if (req.method === 'OPTIONS') {
          res.status = 200
          return
        }

        const body = await parse(req)
        const vbaseApp = VBaseApp(authToken, account, workspace)
        const merchantResponse = await vbaseApp.getFile().then(prop('data')).catch(notFound())

        if (merchantResponse && Object.keys(merchantResponse).length !== 0) {
          const merchantInfo = JSON.parse(merchantResponse.toString())
          const vbaseUser = VBaseUser(authToken, account, workspace, body.userProfileId)
          const userResponse = await vbaseUser.getFile().then(prop('data')).catch(notFound())
          const date = new Date()
          const operationData = {
            userProfileId: body.userProfileId,
            cookie: createCookie(body.orderFormId, body.vtexIdclientAutCookie)
          }

          await processPaymentProfile(body.orderFormId, ioContext, operationData, logger)

          if (userResponse && Object.keys(userResponse).length !== 0) {
            const userInfo = JSON.parse(userResponse.toString())

            if (userInfo.carts && userInfo.carts.findIndex(val => val.orderFormId === body.orderFormId) >= 0) {
              res.status = 400
              res.body = { errorMessage: `O carrinho atual já está salvo.` }
              return
            }

            if (userInfo.carts && userInfo.carts.length < merchantInfo.primaryCartQuantity) {
              userInfo.carts.push({
                orderFormId: body.orderFormId,
                name: body.name,
                date: date.toISOString()
              })

              vbaseUser.saveFile(userInfo)
            } else {
              res.status = 400
              res.body = { errorMessage: `Limite máximo de carrinhos excedido, por favor exclua um carrinho antigo para poder salvar o carrinho atual.` }
              return
            }
          } else {
            vbaseUser.saveFile({
              account,
              userProfileId: body.userProfileId,
              carts: [{
                orderFormId: body.orderFormId,
                name: body.name,
                date: date.toISOString()
              }]
            })
          }

          res.status = 200
          res.body = { data: 'OK' }
        } else {
          res.status = 400
          res.body = { errorMessage: 'O APP não está configurado.' }
        }
      } catch (err) {
        const errorMessage = 'Error saveCart'
        const { status, body, details } = errorResponse(err)

        if (err.response) {
          res.set('Content-Type', 'application/json')
          res.status = status
          res.body = { error: body }
          logger.log(errorMessage, 'error', details)
          return
        }
        logger.log(errorMessage, 'error', { errorMessage: err.message })
        res.body = err
        res.status = status
      }
    },
    removeCartHandler: async (ctx) => {
      const { request: req, response: res, vtex: ioContext } = ctx
      const { account, workspace, authToken } = ioContext
      const logger = colossus(account, workspace, authToken)

      try {
        setDefaultHeaders(res)
        if (req.method === 'OPTIONS') {
          res.status = 200
          return
        }

        const body = await parse(req)
        const vbaseUser = VBaseUser(authToken, account, workspace, body.userProfileId)
        const userResponse = await vbaseUser.getFile().then(prop('data')).catch(notFound())

        if (userResponse && Object.keys(userResponse).length !== 0) {
          const userInfo = JSON.parse(userResponse.toString())
          const indexCart = userInfo.carts.findIndex(val => val.orderFormId === body.orderFormId)

          if (userInfo.carts && indexCart >= 0) {
            userInfo.carts.splice(indexCart, 1)

            vbaseUser.saveFile(userInfo)
            res.status = 200
            res.body = { data: 'OK' }
            return
          } else {
            res.status = 400
            res.body = { errorMessage: 'O carrinho informado não existe para esse usuário!' }
            return
          }
        }

        res.status = 400
        res.body = { errorMessage: 'O usuário não possui carrinhos para exclusão!' }
      } catch (err) {
        const errorMessage = 'Error remove cart'
        const { status, body, details } = errorResponse(err)

        if (err.response) {
          res.set('Content-Type', 'application/json')
          res.status = status
          res.body = { error: body }
          logger.log(errorMessage, 'error', details)
          return
        }
        logger.log(errorMessage, 'error', { errorMessage: err.message })
        res.body = err
        res.status = status
      }
    },
    useCartHandler: async (ctx) => {
      const { request: req, response: res, vtex: ioContext } = ctx
      const { account, workspace, authToken } = ioContext
      const logger = colossus(account, workspace, authToken)

      try {
        setDefaultHeaders(res)
        if (req.method === 'OPTIONS') {
          res.status = 200
          return
        }
        const body = await parse(req)
        const vbaseUser = VBaseUser(authToken, account, workspace, body.userProfileId)
        const userResponse = await vbaseUser.getFile().then(prop('data')).catch(notFound())

        if (userResponse && Object.keys(userResponse).length !== 0) {
          const userInfo = JSON.parse(userResponse.toString())
          const indexCart = userInfo.carts.findIndex(val => val.orderFormId === body.orderFormId)

          if (userInfo.carts && indexCart < 0) {
            res.status = 400
            res.body = { errorMessage: 'O carrinho informado não existe para esse usuário!' }
            return
          }
        } else {
          res.status = 400
          res.body = { errorMessage: 'O usuário não possui carrinho para ser utilizado!' }
          return
        }

        res.status = 200
        res.body = { data: 'OK' }
      } catch (err) {
        const errorMessage = 'Error use Cart'
        const { status, body, details } = errorResponse(err)

        if (err.response) {
          res.set('Content-Type', 'application/json')
          res.status = status
          res.body = { error: body }
          logger.log(errorMessage, 'error', details)
          return
        }
        logger.log(errorMessage, 'error', { errorMessage: err.message })
        res.body = err
        res.status = status
      }
    },
    listCartHandler: async (ctx) => {
      const { request: req, response: res, vtex: ioContext } = ctx
      const { account, workspace, authToken } = ioContext
      const logger = colossus(account, workspace, authToken)

      try {
        setDefaultHeaders(res)
        if (req.method === 'OPTIONS') {
          res.status = 200
          return
        }
        const body = await parse(req)

        if (body.userProfileId && body.userProfileId != '') {
          const vbaseUser = VBaseUser(authToken, account, workspace, body.userProfileId)
          const userResponse = await vbaseUser.getFile().then(prop('data')).catch(notFound())
          let listCarts = []
          let messageRemoveCarts = ''

          if (userResponse && Object.keys(userResponse).length !== 0) {
            const userInfo = JSON.parse(userResponse.toString())
            const checkout = checkoutClient(ioContext)

            let totalCartsExpired = 0

            for (const key in userInfo.carts) {
              if (userInfo.carts.hasOwnProperty(key)) {
                const item = userInfo.carts[key];
                const cookie = createCookie(item.orderFormId, body.vtexIdclientAutCookie)
                const orderForm = await checkout.getOrderForm(item.orderFormId, cookie)

                if (orderForm && orderForm.items && orderForm.items.length > 0) {
                  const products = orderForm.items.map(item => {
                    return {
                      uniqueId: item.uniqueId,
                      name: item.name,
                      imageUrl: item.imageUrl,
                      price: `${orderForm.storePreferencesData.currencySymbol} ${formatPrice(item.price)}`,
                      quantity: item.quantity
                    }
                  })

                  listCarts.push({
                    orderFormId: item.orderFormId,
                    name: item.name,
                    products: products
                  })
                } else {
                  totalCartsExpired++
                }

                if (totalCartsExpired > 0) {
                  messageRemoveCarts = `${totalCartsExpired} carrinho(s) foi(ram) removido(s) pois expirou(aram).`
                }
              }
            }
          }

          res.status = 200
          res.body = {
            messages: messageRemoveCarts,
            listCarts: listCarts
          }
        } else {
          res.status = 400
          res.body = { errorMessage: 'Não existe carrinhos salvos para o usuário!' }
        }
      } catch (err) {
        const errorMessage = 'Error list carts'
        const { status, body, details } = errorResponse(err)

        if (err.response) {
          res.set('Content-Type', 'application/json')
          res.status = status
          res.body = { error: body }
          logger.log(errorMessage, 'error', details)
          return
        }
        logger.log(errorMessage, 'error', { errorMessage: err.message })
        res.body = err
        res.status = status
      }
    },
    postBackHandler: async (ctx) => {
      const { request: req, response: res, vtex: ioContext } = ctx
      const { account, workspace, authToken } = ioContext
      const logger = colossus(account, workspace, authToken)

      try {
        setDefaultHeaders(res)

        if (req.method === 'OPTIONS') {
          res.status = 200
          return
        }

        const { url } = req
        const { userProfileId, orderFormId } = parseQuery(url)
        const { status } = await parse.json(req)

        res.status = 200
        if (!orderStatus[status]) {
          return
        }
        console.log('Pagamento com sucesso, ' + userProfileId + ' - ' + orderFormId)
        const vbaseUser = VBaseUser(authToken, account, workspace, userProfileId)
        const userResponse = await vbaseUser.getFile().then(prop('data')).catch(notFound())

        if (userResponse && Object.keys(userResponse).length !== 0) {
          const userInfo = JSON.parse(userResponse.toString())
          const indexCart = userInfo.carts.findIndex(val => val.orderFormId === orderFormId)

          if (userInfo.carts && indexCart >= 0) {
            userInfo.carts.splice(indexCart, 1)

            vbaseUser.saveFile(userInfo)
            res.status = 200
            res.body = { data: 'OK' }
            return
          }
        }

        res.status = 400
        res.body = { errorMessage: 'O carrinho informado não existe para esse usuário!' }
      } catch (err) {
        const errorMessage = 'Error postBack'
        const { status, body, details } = errorResponse(err)

        if (err.response) {
          res.set('Content-Type', 'application/json')
          res.status = status
          res.body = { error: body }
          logger.log(errorMessage, 'error', details)
          return
        }
        logger.log(errorMessage, 'error', { errorMessage: err.message })
        res.body = err
        res.status = status
      }
    },
    orderFormHandler: async (ctx) => {
      const { request: req, response: res, vtex: ioContext } = ctx
      const { account, workspace, authToken } = ioContext
      const logger = colossus(account, workspace, authToken)

      try {
        setDefaultHeaders(res)

        if (req.method === 'OPTIONS') {
          res.status = 200
          return
        }

        const checkout = checkoutClient(ioContext)
        const orderForm = await checkout.getBlankOrderForm()

        res.status = 200
        res.body = orderForm
      } catch (err) {
        const errorMessage = 'Error postBack'
        const { status, body, details } = errorResponse(err)

        if (err.response) {
          res.set('Content-Type', 'application/json')
          res.status = status
          res.body = { error: body }
          logger.log(errorMessage, 'error', details)
          return
        }
        logger.log(errorMessage, 'error', { errorMessage: err.message })
        res.body = err
        res.status = status
      }
    }
  }
}
