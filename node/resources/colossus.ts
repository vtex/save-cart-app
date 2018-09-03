import { Colossus } from '@vtex/api'

const defaultSubject = '-'

export default (ioContext: ReqContext) => {
  const client = new Colossus(ioContext)
  return {
    log: (message: string, level: LogLevel, details: {} = {}, subject: string = defaultSubject): PromiseLike<void> =>
      client.sendLog(subject, { message, ...details }, level),
  }
}
