import {
  formatCurrency,
} from '../utils'

import { find, propEq } from 'ramda'

import xlsx from 'xlsx'

export const createQuotationXlsx = async (
  cartId,
  carts,
  orderForm,
  intl,
  representative
) => {
  const cart = find(
    propEq('id', cartId),
    carts
  )

  const {
    address,
    cartName,
    creationDate,
    items: cartItems,
    subtotal,
    discounts,
    total,
    shipping,
    paymentTerm
  } = cart


  const {
    clientProfileData: {
      corporateName,
      corporateDocument: cnpj
    },
    storePreferencesData
  } = orderForm

  const createdTime = new Date(creationDate)

  const sheetMatrix = [
    [intl.formatMessage({ id: 'print.representative.name' }), representative.userName, '', intl.formatMessage({ id: 'print.address' }), address.street],
    [intl.formatMessage({ id: 'print.representative.email' }), representative.userEmail , '', intl.formatMessage({ id: 'print.address.number' }), address.number],
    [intl.formatMessage({ id: 'print.customer' }), corporateName, '', intl.formatMessage({ id: 'print.address.neighborhood' }), address.neighborhood],
    [intl.formatMessage({ id: 'print.document'}), cnpj, '', intl.formatMessage({ id: 'print.address.city' }), address.city],
    [intl.formatMessage({ id: 'print.quote.name'}), cartName, '', intl.formatMessage({ id: 'print.address.state' }), address.state],
    [intl.formatMessage({ id: 'list.quote.date'}), createdTime.toDateString(), '', intl.formatMessage({ id: 'print.address.postalCode' }), address.postalCode],
    [intl.formatMessage({ id: 'list.quote.expire'}), createdTime.toDateString(), '', intl.formatMessage({ id: 'print.address.country' }), address.country],
    [intl.formatMessage({ id: 'print.paymentterm'}), paymentTerm],
    [],
    [intl.formatMessage({ id: 'list.code'}), intl.formatMessage({ id: 'list.description'}), intl.formatMessage({ id: 'list.quantity'}), intl.formatMessage({ id: 'list.unitPrice'}), intl.formatMessage({ id: 'list.totalPrice'})]
  ].concat(
    cartItems.map(({
      skuName,
      id,
      sellingPrice,
      quantity
    }) => ([
      id,
      skuName,
      quantity,
      formatCurrency(sellingPrice, storePreferencesData),
      formatCurrency(quantity * sellingPrice, storePreferencesData)
    ])
  )).concat([
    [],
    [],
    ['','','', intl.formatMessage({ id: 'print.subtotal'}), formatCurrency(subtotal, storePreferencesData)],
    ['','','', intl.formatMessage({ id: 'print.discounts'}), formatCurrency(discounts, storePreferencesData)],
    ['','','', intl.formatMessage({ id: 'print.shipping'}), formatCurrency(shipping, storePreferencesData)],
    ['','','', intl.formatMessage({ id: 'print.total'}), formatCurrency(total, storePreferencesData)],
  ])

  const worksheet = xlsx.utils.aoa_to_sheet(sheetMatrix)
  worksheet['!cols'] = [
    {
      wch: 23
    },
    {
      wch: corporateName.length + 3
    },
    {
      wch: 12
    },
    {
      wch: 15
    },
    {
      wch: address.street.length
    }
  ]
  const wb = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(wb, worksheet)

  await xlsx.writeFile(wb, `${cartName}.xlsx`, {bookType: 'xlsx'})
}
