import axios from 'axios'
import { useRef, useState, useCallback, useEffect } from 'react'
import { View } from 'react-native'
import WebView from 'react-native-webview'
import { stringify } from 'qs'
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

const USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1 V2EX_3rd_party'

const CUSTOM_ENDPOINTS = {
  '/page/index/tabs.json': {
    url: 'https://www.v2ex.com',
    dataExtractor: `
      (function() {
        try {
          const tabAnchors = document.querySelectorAll('#Wrapper .content a.tab');
          const tabs = [...tabAnchors].map((a) => {
            const value = new URL(a.href).searchParams.get('tab')
            const label = a.textContent.trim();
            return { value, label }
          });
          window.ReactNativeWebView.postMessage(JSON.stringify(tabs))
        } catch (err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            error: true,
            message: err.message
          }))
        }
      })()
    `
  },
  // params: tab={tab}
  '/page/index/feed.json': {
    url: 'https://www.v2ex.com',
    dataExtractor: `
      (function() {
        try {
          const itemNodes = document.querySelectorAll('#Wrapper .content .cell.item')
          const items = [...itemNodes].map((d) => {
            const member = {
              avatar_mini: d.querySelector('td:nth-child(1) img').src,
              username: d.querySelector('td:nth-child(3) span strong a').textContent,
            }
            const node = {
              title: d.querySelector('td:nth-child(3) a.node').textContent,
              name: d.querySelector('td:nth-child(3) a.node').href.replace(new RegExp('.*\/go\/'), '')
            }
            const title = d.querySelector('.item_title a').textContent;
            const id = d.querySelector('.item_title a').href.replace(new RegExp('.*\/t\/'), '').split('#')[0];
            const formatted_time_ago = d.querySelector('td:nth-child(3) span:last-child').textContent.split('•')[0].trim();
            const last_reply_by =  d.querySelector('td:nth-child(3) span:last-child a')?.textContent
            const replies = d.querySelector('.count_livid')?.textContent;
            return {
              member,
              node,
              id,
              title,
              formatted_time_ago,
              last_reply_by,
              replies
            }
          });
          window.ReactNativeWebView.postMessage(JSON.stringify(items))
        } catch (err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            error: true,
            message: err.message
          }))
        }
      }());
    `
  }
}
const request = async (url, config = {}) => {
  // console.log(url, config)
  if (OFFICIAL_ENDPOINTS.some((endpoint) => url.indexOf(endpoint) > -1)) {
    return instance({
      method: 'GET',
      url: url,
      ...config
    })
  }

  const requestConfig = CUSTOM_ENDPOINTS[url]
  if (!requestConfig) {
    const error = new Error('Unknown API endpoint')
    error.code = 'UNKNOWN_API_ENDPOINT'
    throw error
  }
  return manger.fetch({
    ...config,
    ...requestConfig
  })
}

export default request

const manger = {
  fetch: () => {
    const error = new Error('WebView Fetcher not initialized')
    return Promise.reject(error)
  }
}

const getUrl = (config) => {
  const { url, params } = config
  let query = params ? stringify(params) : ''
  if (query) {
    return `${url}?${query}`
  }
  return url
}

let counter = 0
export const FetcherWebView = () => {
  const [stack, setStack] = useState({})
  const fetcher = useCallback(
    (config) => {
      return new Promise((resolve, reject) => {
        const key = config.key || counter++
        function Wrapped(props) {
          const ref = useRef()
          const timerRef = useRef()
          useEffect(() => {
            timerRef.current = setTimeout(() => {
              reject(new Error('Request Timeout'))
            }, 10000)
          })
          return (
            <WebView
              ref={ref}
              source={{ uri: getUrl(config) }}
              onLoad={() => {
                clearTimeout(timerRef.current)
                // console.log(`${url} LOADED`)
                ref.current.injectJavaScript(config.dataExtractor)
              }}
              onMessage={(event) => {
                if (event.nativeEvent.data) {
                  const data = JSON.parse(event.nativeEvent.data)
                  if (data.error) {
                    reject(data)
                  } else {
                    resolve(data)
                  }
                  setStack((prev) => {
                    const newStack = { ...prev }
                    delete newStack[key]
                    return newStack
                  })
                } else {
                  console.log('event', event)
                }
              }}
            />
          )
        }
        setStack((prev) => ({
          ...prev,
          [key]: Wrapped
        }))
      })
    },
    [setStack]
  )
  manger.fetch = fetcher

  return (
    <View>
      {Object.entries(stack).map(([key, Compo]) => (
        <Compo key={key} />
      ))}
    </View>
  )
}
