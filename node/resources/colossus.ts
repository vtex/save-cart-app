import { Colossus } from '@vtex/api'

const defaultSubject = '-'

/**
 * Realiza o log interno na VTEX
 *
 * @param account Account que identifica a loja
 * @param workspace Workspace da loja
 * @param authToken Token de segurança que identifica a loja
 */
export default (ioContext: ReqContext) => {
  const client = new Colossus(ioContext)
  return {
    log: (message: string, level: LogLevel, details: {} = {}, subject: string = defaultSubject): PromiseLike<void> =>
      client.sendLog(subject, { message, ...details }, level),
  }
}
