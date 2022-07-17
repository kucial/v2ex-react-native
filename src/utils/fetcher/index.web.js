export default function fetcher(url, config) {
  console.log('web fetcher', url, config)
  return Promise.resolve({})
}

export const FetcherWebView = () => {
  return null
}
