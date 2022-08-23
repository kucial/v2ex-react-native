import { MMKV } from 'react-native-mmkv'

const mmkv = new MMKV()

export default mmkv

// FOR REMOTE_DEBUG
// let data = {}
// export default {
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
//   }
// }
