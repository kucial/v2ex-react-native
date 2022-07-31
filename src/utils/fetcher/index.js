import axios from 'axios'
import { useRef, useState, useCallback, useEffect } from 'react'
import { View } from 'react-native'
import WebView from 'react-native-webview'
import { stringify, parse } from 'qs'
import { parse as pathParse } from 'path-to-regexp'
import pathMatch from 'path-match'
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
    host: 'https://www.v2ex.com',
    pathname: '/',
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
    host: 'https://www.v2ex.com',
    pathname: '/',
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
            const last_reply_time = d.querySelector('td:nth-child(3) span:last-child').textContent.split('•')[0].trim();
            const last_reply_by =  d.querySelector('td:nth-child(3) span:last-child a')?.textContent
            const replies = d.querySelector('.count_livid')?.textContent;
            return {
              member,
              node,
              id,
              title,
              last_reply_time,
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
  },

  '/page/planes/node-groups.json': {
    host: 'https://www.v2ex.com',
    pathname: '/planes',
    dataExtractor: `
    (function() {
      try {
        const boxes = document.querySelectorAll('#Wrapper .content > .box')
        const groups = [...boxes].map((d) => {
          const header = d.querySelector('.header');
          const title = header.childNodes[0].textContent;
          const name = header.querySelector('.fr')?.childNodes[0].textContent.replace(' • ', '');
          if (!name) {
            return null;
          }
          const nodes = [...d.querySelectorAll('.inner a.item_node')].map((a) => {
            return {
              title: a.textContent,
              name: (new URL(a.href)).pathname.replace('/go/', '')
            }
          });
          return {
            title,
            name,
            nodes,
          }
        }).filter(Boolean);
        window.ReactNativeWebView.postMessage(JSON.stringify(groups))
      } catch (err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          error: true,
          message: err.message
        }))
      }
    }());
    `
  },

  '/page/go/:name/feed.json': {
    host: 'https://www.v2ex.com',
    pathname: '/go/:name',
    dataExtractor: `
      (function() {
        try {
          const cells = document.querySelectorAll('#Wrapper .content > .box:nth-child(2) .cell')
          const data = [...cells].map((d) => {
            if (!d.querySelector('table')) {
              return;
            }
            const username = d.querySelector('td:nth-child(1) a').getAttribute('href').replace('/member/', '')
            const avatar_normal = d.querySelector('td:nth-child(1) a img').src;
            const id = d.querySelector('.item_title a').href.replace(new RegExp('.*\/t\/'), '').split('#')[0];
            const title = d.querySelector('.topic-link').textContent;
            const replies = Number(d.querySelector('.count_livid')?.textContent.trim() || 0);
            const last_reply_by = d.querySelector('td:nth-child(3) .small strong').textContent;
            const metaText =  d.querySelector('td:nth-child(3) .small').textContent;
            const characterMatch = new RegExp('(\\d+).*个字符').exec(metaText);
            const clickMatch = new RegExp('(\\d+).*次点击').exec(metaText);

            return {
              id,
              title,
              replies,
              characters: characterMatch ? Number(characterMatch[1]) : undefined,
              clicks: clickMatch ? Number(clickMatch[2]) : undefined,
              last_reply_by,
              metaText,
              member: { username, avatar_normal },
            }
          }).filter(Boolean);
          const pageText = document.querySelector('#Wrapper .content > .box:nth-child(2) .inner td[align=center]')?.textContent
          let pagination;
          if (pageText) {
            pagination = {
              current: Number(pageText.split('/')[0]),
              total: Number(pageText.split('/')[1])
            }
          }
          window.ReactNativeWebView.postMessage(JSON.stringify({
            data,
            pagination,
          }))
        } catch (err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            error: true,
            message: err.message
          }))
        }
      }());
    `
  },

  '/page/member/:username/topics.json': {
    host: 'https://www.v2ex.com',
    pathname: '/member/:username/topics',
    dataExtractor: `
    (function() {
      try {
        const cells = document.querySelectorAll('#Wrapper .content .box .cell')
        if (cells.length === 1 && cells[0].querySelector('img')?.src.indexOf('lock') > -1) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            error: true,
            code: 'member_locked',
            message: cells[0].textContent.trim()
          }))
          return
        }

        const data = [...cells].map((d) => {
          if (!d.querySelector('table')) {
            return;
          }

          const member = {
            username: d.querySelector('td:nth-child(1) strong a').getAttribute('href').replace('/member/', ''),
          }
          const node = {
            name: d.querySelector('td:nth-child(1) .node').getAttribute('href').replace('/go/', ''),
            title: d.querySelector('td:nth-child(1) .node').textContent,
          }

          const id = Number(d.querySelector('.topic-link').getAttribute('href').replace(new RegExp('.*\/t\/'), '').split('#')[0]);
          const title = d.querySelector('.topic-link').textContent;
          const last_reply_time = d.querySelector('td:nth-child(1) span:last-child').textContent.split('•')[0].trim();
          const last_reply_by = d.querySelector('td:nth-child(1) span:last-child a')?.textContent;
          const replies = Number(d.querySelector('.count_livid')?.textContent.trim() || 0);

          return {
            id,
            title,
            replies,
            last_reply_by,
            last_reply_time,
            member,
            node,
          }
        }).filter(Boolean);
        const pageText = document.querySelector('#Wrapper .content > .box .inner td[align=center]')?.textContent
        let pagination;
        if (pageText) {
          pagination = {
            current: Number(pageText.split('/')[0]),
            total: Number(pageText.split('/')[1])
          }
        }
        window.ReactNativeWebView.postMessage(JSON.stringify({
          data,
          pagination,
        }))
      } catch (err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          error: true,
          message: err.message
        }))
      }
    }());
    `
  },

  '/page/member/:username/replies.json': {
    host: 'https://www.v2ex.com',
    pathname: '/member/:username/replies',
    dataExtractor: `
    (function() {
      try {
        const getUsername = (str) => {
          const result = /\\s+(.*?)\\s+/.exec(str)
          return result?.[1]
        }
        const docks = document.querySelectorAll('#Wrapper .content .box .dock_area')

        const data = [...docks].map((d) => {

          const topic = {
            id: Number(d.querySelector('table td span.gray a').getAttribute('href').replace(new RegExp('.*\/t\/'), '').split('#')[0]),
            title: d.querySelector('table td span.gray a').textContent,
            member: {
              username: getUsername(d.querySelector('table td span.gray').childNodes[0].textContent),
            },
          }

          return {
            topic_id: topic.id,
            content_rendered: d.nextElementSibling.innerHTML.trim(),
            topic,
            reply_time: d.querySelector('table td span.fade').textContent
          };


        }).filter(Boolean);
        const pageText = document.querySelector('#Wrapper .content > .box .inner td[align=center]')?.textContent
        let pagination;
        if (pageText) {
          pagination = {
            current: Number(pageText.split('/')[0]),
            total: Number(pageText.split('/')[1])
          }
        }
        window.ReactNativeWebView.postMessage(JSON.stringify({
          data,
          pagination,
        }))
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
  let urlParams = {}
  const requestEntry = Object.entries(CUSTOM_ENDPOINTS).find(([path]) => {
    if (path === url) {
      return true
    }
    const match = pathMatch()(path)(url.split('?')[0])
    if (match) {
      urlParams = match
      return true
    }
  })

  if (!requestEntry) {
    const error = new Error(`Unknown API endpoint for ${url}`)
    error.code = 'UNKNOWN_API_ENDPOINT'
    throw error
  }

  urlParams = {
    ...urlParams,
    ...parse(url.split('?')[1] || '')
  }

  return manger.fetch({
    ...config,
    ...requestEntry[1],
    params: {
      ...(config.params || {}),
      ...urlParams
    }
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
  const { host, pathname, params = {} } = config
  const tokens = pathParse(pathname)
  const cParams = { ...params }
  const parts = tokens.map((item) => {
    if (item instanceof Object) {
      if (cParams[item.name]) {
        delete cParams[item.name]
        return `/${params[item.name]}`
      }
      return ''
    }
    return item
  })

  const parsedPath = parts.join('')
  const queryStr = stringify(cParams)
  if (queryStr) {
    return `${host}${parsedPath}?${queryStr}`
  }
  return `${host}${parsedPath}`
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
          console.log(getUrl(config))
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
