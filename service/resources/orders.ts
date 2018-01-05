import axios from 'axios'

const client = axios.create({
    timeout: 4000,
})

const routes = {
    order: (account, env = 'stable') => `http://${account}.vtexcommerce${env}.com.br/api/oms/pvt/orders`,
    orderPaymentTransaction: (account, orderId) => `${routes.order(account)}/${orderId}/payment-transaction`,
    orderById: (account, orderId) => `${routes.order(account)}/${orderId}`,
    orderList: (account, params) => `${routes.order(account)}/${params}`
}

/**
 * Obtém os dados das transações de pagamento de um determinado pedido
 *
 * @param account Account que identifica a loja
 * @param authToken Token de segurança que identifica a loja
 * @param orderId Identificador do pedido
 */
export async function getOrderPaymentTransaction(account: string, authToken: string, orderId: string) {
    const url = routes.orderPaymentTransaction(account, orderId)
    const headers = {
        Authorization: `bearer ${authToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
    }
    return client.get(url, { headers })
}

/**
 * Obtém os dados pedido pelo identificador
 *
 * @param account Account que identifica a loja
 * @param authToken Token de segurança que identifica a loja
 * @param orderId Identificador do pedido
 */
export async function getOrder(account: string, authToken: string, orderId: string) {
    const url = routes.orderById(account, orderId)
    const headers = {
        Authorization: `bearer ${authToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
    }
    return client.get(url, { headers })
}

/**
 * Obtém uma lista de pedidos que foram realizados pelo usuário do e-mail informado
 * 
 * @param account Account que identifica a loja
 * @param authToken Token de segurança que identifica a loja
 * @param email E-mail que identifica o usuário
 */
export async function getOrderList(account: string, authToken: string, email: string) {
    let todayDate = new Date()
    let tomorrowDate = new Date()
    tomorrowDate.setDate(todayDate.getDate() + 1)
    const tomorrow = tomorrowDate.toISOString().split('T')[0]
    const today = todayDate.toISOString().split('T')[0]

    const params = `?f_creationDate=creationDate:[${today}T02:00:00.000Z+TO+${tomorrow}T01:59:59.999Z]&utc=-0200&q=${email}`
    const url = routes.orderList(account, params)
    const headers = {
        Authorization: `bearer ${authToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
    }
    return client.get(url, { headers })
}