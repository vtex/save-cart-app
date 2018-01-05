import axios from 'axios'

const client = axios.create({
    timeout: 4000,
})

/**
 * Recebe o token que identifica o usuário, faz uma chamada GET ao endpoint que descriptografa esse token
 * e retorna os dados do usuário. ex.: id, email, etc
 * 
 * @param authToken Token de identificação do usuário
 */
export async function getDataUser( authToken: string, userToken: string) {
    const url = `//vtexid.vtex.com.br/api/vtexid/pub/authenticated/user?authToken=${userToken}`
    const config = {
        headers: {
            'Proxy-Authorization': authToken,             
            'X-Vtex-Proxy-To': `https:${url}`
        }
    }

    return client.get(`http:${url}`, config)
}