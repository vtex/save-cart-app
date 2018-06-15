/**
 * Retorna o nome do app com a versão
 */
export function getUserAgent(): string {
    return `VTEX Save-cart ` + process.env.VTEX_APP_VERSION
}