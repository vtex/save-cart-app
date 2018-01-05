import * as crypto from 'crypto'

/**
 * Encriptografa os dados do cartão com um hash MD5
 *
 * @param bin Os primeiros dígitos do cartão
 * @param lastDigits Os últimos dígitos do cartão
 */
export function encryptCard(bin: string, lastDigits: string) {
    bin = bin && bin != null ? bin: ''
    lastDigits = lastDigits && lastDigits != null ? lastDigits: ''
    const joined = bin + lastDigits
    const hash = crypto.createHash('md5').update(joined).digest('hex')
    
    return hash
}

/**
 * Obtenho o primeiro Id do cartão e do endereço da lista que veio do precheckoutData, e crio um novo
 * objeto com os dados necessário para se realizar a chamada so express checkout, que irá obter os
 * dados completos do cartão, endereço e do usuário
 *
 * @param precheckoutData Lista de cartões e endereços que vieram da masterpass
 * @param body Informações do pedido
 */
export function createDataToExpress(precheckoutData, body) {
    const card = precheckoutData.cards.find((element) => { if (element.default == true) return element })
    const address = precheckoutData.shippingAddresses.find((element) => { if (element.default == true) return element })
    const dataToExpress = {
        amount: body.total,
        cardId: card.cardId,
        shippingAddressId: address.addressId,
        checkoutId: body.merchantCheckoutId,
        digitalGoods: false,
        currency: body.currencyCode,
        pairingId: precheckoutData.pairingId,
        preCheckoutTransactionId: precheckoutData.preCheckoutTransactionId
    }

    return dataToExpress
}

/**
 * Retorna os dados do usuário da carteira da masterpass
 * 
 * @param fullName Nome completo do usuário da carteira da masterpass
 * @param personalInfo Dados do usuário da carteira da masterpass
 */
export function createPersonalInfo(fullName, personalInfo) {
    return {
        fullName: fullName,
        nationalId: personalInfo.nationalId,
        recipientPhone: personalInfo.recipientPhone,
        recipientEmailAddress: personalInfo.recipientEmailAddress
    }
}