import { VBase } from '@vtex/api'

const service: string = "save-cart"
const userAgent: string = "VTEX Save Cart " + process.env.VTEX_APP_VERSION //Comando para pegar a versão do app

/**
 * Função que faz a interface com o VBase (O banco de dados, no qual eu persisto arquivos)
 * Essa função é responsável pelos dados da APP
 * 
 * saveFile - Salva os dados no VBase
 * getFile - Obtém os dados que foram salvos no VBase
 *
 * @param authToken Token de segurança que identifica a loja
 * @param account Account que identifica a loja
 * @param workspace Workspace da loja
 */
export function VBaseApp(authToken, account, workspace) {
    const client = new VBase({ account, workspace, region: 'aws-us-east-1', authToken, userAgent })
    const fileName = `merchantData.txt`

    return {
        saveFile: (data) => {
            var Readable = require('stream').Readable;
            var s = new Readable();
            s._read = function noop() { };
            s.push(JSON.stringify(data));
            s.push(null);

            return client.saveFile(service, fileName, s, false)
        },
        getFile: (): any => {
            return client.getFile(service, fileName)
        },
    }
}

/**
 * Função que faz a interface com o VBase (O banco de dados, no qual eu persisto arquivos)
 * Essa função é responsável pelos dados do usuário que está comprando na loja
 * 
 * saveFile - Salva os dados no VBase
 * getFile - Obtém os dados que foram salvos no VBase
 * 
 * @param authToken Token de segurança que identifica a loja
 * @param account Account que identifica a loja
 * @param workspace Workspace da loja
 * @param userProfileId Identificador do usuário
 */
export function VBaseUser(authToken, account, workspace, userProfileId) {
    const client = new VBase({ account, workspace, region: 'aws-us-east-1', authToken, userAgent })
    const fileName = `${userProfileId}_${account}.txt`

    return {
        saveFile: (data) => {
            var Readable = require('stream').Readable;
            var s = new Readable();
            s._read = function noop() { };
            s.push(JSON.stringify(data));
            s.push(null);

            return client.saveFile(service, fileName, s, false)
        },
        getFile: (): any => {
            return client.getFile(service, fileName)
        },
    }
}
