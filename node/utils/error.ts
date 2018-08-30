export const errorResponse = (err) => {
  if (err.response) {
    const status = err.response.status ? err.response.status : 500
    const { url=null, method=null, data=null } = (err.response.config || {})
    const error = err.response.data ? err.response.data.error : null
    const operationId = err.response.data ? err.response.data.operationId : null
    return { status, body: error, details: { url, method, data, operationId } }
  }
  return { status: 500, body: err, details: null }
}
