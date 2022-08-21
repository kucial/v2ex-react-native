import { MMKV } from 'react-native-mmkv'

const storage = new MMKV()

// Mock MMKV storage to enable remote debug
// let data = {}
// const storage = {
//   contains(key) {
//     return data[key] !== undefined
//   },
//   getString(key) {
//     return data[key]
//   },
//   delete(key) {
//     delete data[key]
//   },
//   set(key, value) {
//     data[key] = value
//   },
//   clearAll() {
//     data = {}
//   },
//   getAllKeys() {
//     return Object.keys(data);
//   }
// }

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
    console.log(str)
    storage.set(key, str)
  }
}
