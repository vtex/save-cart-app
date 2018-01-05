import { Colossus } from '@vtex/api'
import { getUserAgent } from '../utils/conf'

const defaultSubject = '-'
const userAgent: string = getUserAgent()

/**
 * Realiza o log interno na VTEX
 * 
 * @param account Account que identifica a loja
 * @param workspace Workspace da loja
 * @param authToken Token de segurança que identifica a loja
 */
export default (account: string, workspace: string, authToken: string) => {
  const client = new Colossus({ account, workspace, authToken, region: 'aws-us-east-1', userAgent })
  return {
    log: (message: string, level: LogLevel, details: {} = {}, subject: string = defaultSubject): PromiseLike<void> =>
      client.sendLog(subject, { message, ...details }, level),
  }
}