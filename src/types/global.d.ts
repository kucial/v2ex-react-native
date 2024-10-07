declare module '@env' {
  export const SENTRY_DSN: string
  export const IMGUR_CLIENT_ID: string
  export const IOS_APP_ID: string?
}
declare module '*.png' {
  const value: import('react-native').ImageRequireSource
  export default value
}
