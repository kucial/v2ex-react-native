import storage from '../storage'

const cache = (cache) => {
  const swrCache = {
    get: (key) => {
      const valueFromMap = cache.get(key)

      if (valueFromMap) {
        return valueFromMap
      }

      if (typeof key === 'string' && storage.contains(key)) {
        const value = storage.getString(key)
        return value ? JSON.parse(value) : undefined
      }

      return undefined
    },
    set: (key, value) => {
      cache.set(key, value)

      if (typeof key === 'string') {
        storage.set(key, JSON.stringify(value))
      }
    },
    delete: (key) => {
      cache.delete(key)

      if (typeof key === 'string' && storage.contains(key)) {
        storage.delete(key)
      }
    }
  }

  return swrCache
}

export default cache
