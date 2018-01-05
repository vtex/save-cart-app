const brandToPaymentSystem = {
    VISA: 'Visa',
    MASTERCARD: 'Mastercard',
    AMEX: 'American Express',
    DISCOVER: 'Discover',
    ELECTRON: 'Visa Electron',
    ELO: 'Elo',
}

export default (cardBrand) => {
    return brandToPaymentSystem[cardBrand]
}
