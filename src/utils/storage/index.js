import { MMKV } from 'react-native-mmkv'

const isDebuggingRemotelyActive = () => typeof importScripts === 'function'

let storage
if (isDebuggingRemotelyActive()) {
  let data = {}
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
    }
  }
} else {
  console.log('MMKV storage')
  storage = new MMKV()
}

export default storage

export const getJSON = (key, fallback) => {
  const str = storage.getString(key)
  if (typeof str !== 'string') {
    return fallback || undefined
  }
  return JSON.parse(str)
}

export const setJSON = (key, value) => {
  if (value === undefined) {
    storage.delete(key)
  } else {
    const str = JSON.stringify(value)
    // console.log(str)
    storage.set(key, str)
  }
}
