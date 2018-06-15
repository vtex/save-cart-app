import { prop } from 'ramda'
import axios from 'axios'

const client = axios.create({
  timeout: 4000,
})

const url = (account, env = 'stable') => `http://${account}.vtexcommerce${env}.com.br/api/portal/pvt/sites/default/configuration`

/**
 * Ativa a extensão na loja (extension store)
 * 
 * @param account Account que identifica a loja
 * @param authToken Token de segurança que identifica a loja
 */
export async function enableIoExtensions(account: string, authToken: string) {
  const headers = {
    Authorization: `bearer ${authToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  const configuration = await client.get(url(account), { headers }).then(prop('data'))
  configuration['ioExtensions'] = true
  return client.put(url(account), configuration, { headers })
}
