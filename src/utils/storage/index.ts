import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

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
