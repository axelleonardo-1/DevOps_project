export function requestLogger() {
  return async (c, next) => {
    const startedAt = Date.now()
    const requestId = c.req.header('x-request-id') || crypto.randomUUID()

    c.set('requestId', requestId)

    await next()

    const durationMs = Date.now() - startedAt
    c.header('x-request-id', requestId)

    console.log(
      JSON.stringify({
        requestId,
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        durationMs,
      }),
    )
  }
}
