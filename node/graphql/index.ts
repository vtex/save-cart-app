import { Apps } from '@vtex/api'

const appMajor = process.env.VTEX_APP_VERSION.split('.')[0]

const getAppId = () => {
    return `vtex.savecart@${appMajor}.x`
}

export const resolvers = {
    Query: {
        getSetupConfig: async function (_, __, ctx) {
            const apps = new Apps(ctx.vtex)
            const filter = getAppId()
            return apps.getAppSettings(filter).then((r) => (r))
        }
    }
}