import { MMKV } from 'react-native-mmkv'
// import { initializeMMKVFlipper } from 'react-native-mmkv-flipper-plugin'

const isDebuggingRemotelyActive = () =>
  'importScripts' in global && typeof global.importScripts === 'function'

interface Storage {
  contains: (key: string) => boolean
  getString: (key: string) => string
  delete: (key: string) => void
  set: (key: string, value: string) => void
  clearAll: () => void
  getAllKeys: () => string[]
}

let storage: Storage
if (isDebuggingRemotelyActive()) {
  let data: Record<string, string> = {}
  console.log('Memory storage')
  storage = {
    contains(key) {
      return data[key] !== undefined
    },
    getString(key) {
      return data[key]
    },
    delete(key) {
      delete data[key]
    },
    set(key, value) {
      data[key] = value
    },
    clearAll() {
      data = {}
    },
    getAllKeys() {
      return Object.keys(data)
    },
  }
} else {
  console.log('MMKV storage')
  storage = new MMKV()
  // if (__DEV__) {
  //   initializeMMKVFlipper({ default: storage })
  // }
}

export const stateStorage = {
  setItem: (name: string, value: string) => {
    storage.set(name, value)
  },
  getItem: (name: string) => {
    const value = storage.getString(name)
    return value === undefined ? null : value
  },
  removeItem: (name: string) => {
    storage.delete(name)
  },
}

export default storage

export const getJSON = (key: string, fallback?: any) => {
  const str = storage.getString(key)
  if (typeof str !== 'string') {
    return fallback ?? undefined
  }
  return JSON.parse(str)
}

export const setJSON = (key: string, value: any) => {
  if (value === undefined) {
    storage.delete(key)
  } else {
    const str = JSON.stringify(value)
    storage.set(key, str)
  }
}
