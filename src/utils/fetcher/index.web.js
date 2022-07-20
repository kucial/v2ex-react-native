import axios from 'axios'

import { OFFICIAL_ENDPOINTS } from './constants'

const instance = axios.create({
  baseURL: 'https://www.v2ex.com',
  timeout: 10000
})

instance.interceptors.response.use(
  function (response) {
    return response.data
  },
  function (error) {
    return Promise.reject(error)
  }
)

const CUSTOM_ENDPOINTS = {
  '/page/index/tabs.json': {
    data: [
      {
        value: 'latest',
        label: '最新'
      },
      {
        value: 'hottest',
        label: '最热'
      },
      {
        value: 'all',
        label: '全部'
      },
      {
        value: 'tech',
        label: '技术'
      },
      {
        value: 'idea',
        label: '创意'
      },
      {
        value: 'play',
        label: '好玩'
      },
      {
        value: 'apple',
        label: 'Apple'
      },
      {
        value: 'job',
        label: '酷工作'
      },
      {
        value: 'deals',
        label: '交易'
      },
      {
        value: 'city',
        label: '城市'
      }
    ]
  }
}

export default function fetcher(url, config) {
  console.log('web fetcher', url, config)
  if (OFFICIAL_ENDPOINTS.some((endpoint) => url.indexOf(endpoint) > -1)) {
    return instance({
      method: 'GET',
      url: url,
      ...config
    })
  }

  if (CUSTOM_ENDPOINTS[url]) {
    return Promise.resolve(CUSTOM_ENDPOINTS[url].data)
  }

  const error = new Error('Unknown API endpoint')
  error.code = 'UNKNOWN_API_ENDPOINT'
  throw error
}

export const FetcherWebView = () => {
  return null
}
