function cloneBytes(value) {
  return value.slice(0)
}

export function createFakeR2Bucket() {
  const objects = new Map()

  return {
    async put(key, value, options = {}) {
      const bytes = value instanceof ArrayBuffer ? new Uint8Array(value) : new Uint8Array(await value.arrayBuffer())
      objects.set(key, {
        body: cloneBytes(bytes),
        httpMetadata: options.httpMetadata || {},
        httpEtag: `"${key}"`,
      })
      return { key }
    },
    async get(key) {
      const object = objects.get(key)
      if (!object) {
        return null
      }

      return {
        body: cloneBytes(object.body),
        httpMetadata: object.httpMetadata,
        httpEtag: object.httpEtag,
      }
    },
    async delete(key) {
      objects.delete(key)
    },
  }
}
