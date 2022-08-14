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
    scripts: [
      `
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
    ]
  },
  // params: tab={tab}
  '/page/index/topics.json': {
    host: 'https://www.v2ex.com',
    pathname: '/',
    scripts: [
      `
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
          window.ReactNativeWebView.postMessage(JSON.stringify({
            data: items,
          }))
        } catch (err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            error: true,
            message: err.message
          }))
        }
      }());
    `
    ]
  },

  '/page/recent/topics.json': {
    host: 'https://www.v2ex.com',
    pathname: '/recent',
    scripts: [
      `
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
            const last_reply_by =  d.querySelector('td:nth-child(3) > span:last-child a[href^="/member/"]')?.textContent;
            const replies = d.querySelector('.count_livid')?.textContent;
            return {
              member,
              node,
              id: Number(id),
              title,
              last_reply_time,
              last_reply_by,
              replies: Number(replies || 0)
            }
          });
          const paginationText = document.querySelector('#Wrapper .content .inner:last-child [align=center]').textContent;

          window.ReactNativeWebView.postMessage(JSON.stringify({
            data: items,
            pagination: paginationText ? {
              current:  Number(paginationText.split('/')[0])  || 1,
              total:  Number(paginationText.split('/')[1])  || 1,
            } : null
          }))
        } catch (err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            error: true,
            message: err.message
          }))
        }
      }());
      `
    ]
  },

  '/page/t/:id/replies.json': {
    host: 'https://www.v2ex.com',
    pathname: '/t/:id',
    scripts: [
      `
      (function() {
        try {
          const items = document.querySelectorAll('#Wrapper .content .box div[id^=r_]')
          const data = [...items].map((d) => {
            const member = {
              username: d.querySelector('strong a[href^="/member/"]').textContent.trim(),
              avatar_normal: d.querySelector('img.avatar').src
            }
            const content_rendered = d.querySelector('.reply_content').innerHTML;
            const replyInfo = d.querySelector('td:nth-child(3) span.fade.small').textContent.trim();
            let reply_time;
            let reply_device;
            [reply_time, reply_device] = replyInfo.split(' via ');
            const heartImg = d.querySelector('td:nth-child(3) span.small.fade img[alt="❤️"]');
            const thanks_count = heartImg ? Number(heartImg.nextSibling.textContent.trim()) : 0;
            return {
              id: Number(d.id.replace('r_', '')),
              content_rendered,
              member,
              reply_time,
              reply_device,
              thanks_count,
              thanked: !!d.querySelector('.thanked'),
              num: Number(d.querySelector('.no').textContent)
            }
          }).filter(Boolean);

          let pagination = { current: 1, total: 1 };
          const paginationCell = document.querySelector('#Wrapper .box:nth-child(5) .cell:nth-child(2):not([id^=r_])')
          if (paginationCell) {
            pagination.current = Number(paginationCell.querySelector('.page_current')?.textContent);
            const total = /\\d+/.exec(paginationCell.querySelector('div:nth-child(2)').textContent);
            pagination.total = Number(total)
          }

          window.ReactNativeWebView.postMessage(JSON.stringify({
            data,
            pagination
          }))
        } catch (err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            error: true,
            message: err.message
          }))
        }
      }());
      `
    ]
  },

  '/page/t/:id/thank-reply.json': {
    host: 'https://www.v2ex.com',
    pathname: '/t/:id',
    getScripts: ({ data }) => {
      return [
        // post data
        `(function() {
          try {
            const d = document.querySelector('#r_${data.replyId}');
            if (!!d.querySelector('.thanked')) {
              // just extract data;
              const member = {
                username: d.querySelector('strong a[href^="/member/"]').textContent.trim(),
                avatar_normal: d.querySelector('img.avatar').src
              }
              const content_rendered = d.querySelector('.reply_content').innerHTML;
              const replyInfo = d.querySelector('td:nth-child(3) span.fade.small').textContent.trim();
              let reply_time;
              let reply_device;
              [reply_time, reply_device] = replyInfo.split(' via ');
              const heartImg = d.querySelector('td:nth-child(3) span.small.fade img[alt="❤️"]');
              const thanks_count = heartImg ? Number(heartImg.nextSibling.textContent.trim()) : 0;
              const data =  {
                id: Number(d.id.replace('r_', '')),
                content_rendered,
                member,
                reply_time,
                reply_device,
                thanks_count,
                thanked: !!d.querySelector('.thanked'),
                num: Number(d.querySelector('.no').textContent)
              }
              window.ReactNativeWebView.postMessage(JSON.stringify({
                data,
              }))
            } else {
              const callback = function(mutationList, observer) {
                if (mutationList.some((m) => m.target.classList.contains('thanked'))) {
                  const member = {
                    username: d.querySelector('strong a[href^="/member/"]').textContent.trim(),
                    avatar_normal: d.querySelector('img.avatar').src
                  }
                  const content_rendered = d.querySelector('.reply_content').innerHTML;
                  const replyInfo = d.querySelector('td:nth-child(3) span.fade.small').textContent.trim();
                  let reply_time;
                  let reply_device;
                  [reply_time, reply_device] = replyInfo.split(' via ');
                  const heartImg = d.querySelector('td:nth-child(3) span.small.fade img[alt="❤️"]');
                  const thanks_count = heartImg ? Number(heartImg.nextSibling.textContent.trim()) : 0;
                  const data =  {
                    id: Number(d.id.replace('r_', '')),
                    content_rendered,
                    member,
                    reply_time,
                    reply_device,
                    thanks_count: thanks_count + 1,
                    thanked: !!d.querySelector('.thanked'),
                    num: Number(d.querySelector('.no').textContent)
                  }
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    data,
                  }))
                }
              }

              const observer = new MutationObserver(callback);
              const config = {
                attributes: true,
                childList: true,
                subtree: true
              };
              observer.observe(d, config);
              thankReply(${data.replyId})
            }
          } catch (err) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              error: true,
              message: err.message
            }))
          }
        }())`
      ]
    }
  },

  // post reply
  '/page/t/:id/reply.json': {
    host: 'https://www.v2ex.com',
    pathname: '/t/:id',
    getScripts: ({ data }) => {
      return [
        `
        (function() {
          try {
            const data = ${JSON.stringify(data)};
            const replyBox = document.getElementById('reply-box');
            replyBox.querySelector('[name=content]').value = data.content;
            replyBox.querySelector('input[type=submit]').click();
          } catch (err) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              error: true,
              message: err.message
            }))
          }
        }());
        `,
        `
        (function() {
          try {
            const replyNum = window.location.hash.replace('#reply', '');
            const d = [...document.querySelectorAll('.cell[id^=r_]')].find((d) => {
              return d.querySelector('.no')?.textContent.trim() === replyNum
            })
            if (d) {
              const member = {
                username: d.querySelector('strong a[href^="/member/"]').textContent.trim(),
                avatar_normal: d.querySelector('img.avatar').src
              }
              const content_rendered = d.querySelector('.reply_content').innerHTML;
              const replyInfo = d.querySelector('td:nth-child(3) span.fade.small').textContent.trim();
              let reply_time;
              let reply_device;
              [reply_time, reply_device] = replyInfo.split(' via ');
              const heartImg = d.querySelector('td:nth-child(3) span.small.fade img[alt="❤️"]');
              const thanks_count = heartImg ? Number(heartImg.nextSibling.textContent.trim()) : 0;
              const data =  {
                id: Number(d.id.replace('r_', '')),
                content_rendered,
                member,
                reply_time,
                reply_device,
                thanks_count,
                thanked: !!d.querySelector('.thanked'),
                num: Number(d.querySelector('.no').textContent)
              }
              window.ReactNativeWebView.postMessage(JSON.stringify({
                data,
              }));
            } else {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                error: true,
                message: 'No reply found',
                code: 'NO_REPLY_FOUND',
              }))
            }

          } catch (err) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              error: true,
              message: err.message
            }))
          }
        }())
        `
      ]
    }
  },

  '/page/planes/node-groups.json': {
    host: 'https://www.v2ex.com',
    pathname: '/planes',
    scripts: [
      `
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
    ]
  },

  '/page/go/:name/feed.json': {
    host: 'https://www.v2ex.com',
    pathname: '/go/:name',
    scripts: [
      `
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
            const characterMatch = /(\\d+)/.exec(metaText.split('•')?.[1] || '');
            const clickMatch = /(\\d+)/.exec(metaText.split('•')?.[2] || '');

            return {
              id,
              title,
              replies,
              characters: characterMatch ? Number(characterMatch[1]) : undefined,
              clicks: clickMatch ? Number(clickMatch[1]) : undefined,
              last_reply_by,
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
    ]
  },

  '/page/member/:username/topics.json': {
    host: 'https://www.v2ex.com',
    pathname: '/member/:username/topics',
    scripts: [
      `
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
    ]
  },

  '/page/member/:username/replies.json': {
    host: 'https://www.v2ex.com',
    pathname: '/member/:username/replies',
    scripts: [
      `
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
    ]
  },

  '/page/notifications.json': {
    host: 'https://www.v2ex.com',
    pathname: '/notifications',
    scripts: [
      `(function() {
        try {
          const cells = document.querySelectorAll('#notifications .cell');
          const data = [...cells].map((d) => {
            const memberImage = d.querySelector('img.avatar')
            if (!memberImage) { return null }
            const member = {
              username: memberImage.alt,
              avatar_normal: memberImage.src,
            }
            const topicLink = d.querySelector('a[href^="/t/"]')
            const topic = {
              id: Number(topicLink.getAttribute('href').replace(new RegExp('.*\/t\/'), '').split('#')[0]),
              title: topicLink.textContent.trim()
            }
            // topic_id
            // content_rendered
            // reply_time
            return {
              member,
              topic,
              topic_id: topic.id,
              content_rendered: d.querySelector('.payload')?.innerHTML.trim(),
              reply_time: d.querySelector('.snow')?.innerText,
            }
          });
          const pageText = document.querySelector('#notifications')?.previousElementSibling?.querySelector('td[align="center"]')?.textContent
          let pagination;
          if (pageText) {
            pagination = {
              current: Number(pageText.split('/')[0]),
              total: Number(pageText.split('/')[1])
            }
          }

          window.ReactNativeWebView.postMessage(JSON.stringify({
            data,
            pagination
          }))
        } catch (err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            error: true,
            message: err.message
          }))
        }
      }());`
    ]
  },

  '/page/my/topics.json': {
    host: 'https://www.v2ex.com',
    pathname: '/my/topics',
    scripts: [
      `(function() {
        try {
          const cells = document.querySelectorAll('#Wrapper .box .cell.item');
          const data = [...cells].map((d) => {
            const member = {
              avatar_normal: d.querySelector('td:nth-child(1) img')?.src,
              username: d.querySelector('td:nth-child(3) span strong a').textContent,
            }
            const node = {
              title: d.querySelector('td:nth-child(3) a.node').textContent,
              name: d.querySelector('td:nth-child(3) a.node').href.replace(new RegExp('.*\/go\/'), '')
            }
            const title = d.querySelector('.item_title a').textContent;
            const id = Number(d.querySelector('.item_title a').href.replace(new RegExp('.*\/t\/'), '').split('#')[0]);
            const last_reply_time = d.querySelector('.topic_info span[title]').textContent.trim();
            const last_reply_by = d.querySelector('.topic_info strong:last-child a')?.textContent
            const replies = d.querySelector('.count_livid')?.textContent;
            return {
              member,
              node,
              id,
              title,
              last_reply_time,
              last_reply_by,
              votes: d.querySelector('.votes')?.textContent.trim(),
              replies: Number(replies) || 0,
            }
          })
          window.ReactNativeWebView.postMessage(JSON.stringify({
            data: data,
          }))
        } catch (err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            error: true,
            message: err.message
          }))
        }
      }())
      `
    ]
  },

  '/custom/auth/current-user.json': {
    host: 'https://www.v2ex.com',
    pathname: '/',
    scripts: [
      `
    (function() {
      try {
        const username = document.querySelector('#menu-entry img.avatar')?.getAttribute('alt');
        if (!username) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            error: true,
            code: 'not_authenticated',
            message: '未登录'
          }));
        } else {
          fetch('/api/members/show.json?username='+username)
            .then((res) => res.json())
            .then((user) => {
              window.ReactNativeWebView.postMessage(JSON.stringify(user))
            })
          ;
        }
      } catch (err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          error: true,
          message: err.message
        }))
      }
    }());
    `
    ]
  },

  '/custom/auth/logout.json': {
    host: 'https://www.v2ex.com',
    pathname: '/',
    scripts: [
      // click logout
      `
      (function() {
        try {
          const logoutAnchor = document.querySelector('a[href^="/signout"]');
          if (logoutAnchor) {
            logoutAnchor.click();
          } else {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              error: true,
              message: 'Logout link not found',
              code: 'PAGE_UNEXPECTED',
            }))
          }
        } catch (err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            error: true,
            message: err.message
          }))
        }
      }());
    `,
      // check if logout sccess
      `(function() {
        const logoutAnchor = document.querySelector('a[href^="/signout"]');
        if (!logoutAnchor) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            success: true,
          }))
        }
      }())`
    ]
  }
}
const request = async (url, config = {}) => {
  console.log('api request', url)
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

  return manager.fetch({
    ...config,
    ...requestEntry[1],
    params: {
      ...(config.params || {}),
      ...urlParams
    }
  })
}

export default request

const manager = {
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

const getScripts = (config) => {
  if (config.getScripts) {
    return config.getScripts(config)
  }
  if (Array.isArray(config.scripts)) {
    return [...config.scripts]
  }
  return [config.scripts]
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
          const scriptsToInject = useRef(getScripts(config))
          const url = getUrl(config)
          return (
            <WebView
              ref={ref}
              source={{ uri: url }}
              onShouldStartLoadWithRequest={() => true}
              // sharedCookiesEnabled={true}
              onLoadStart={() => {
                console.log(`load start: ${url}`)
                timerRef.current = setTimeout(() => {
                  reject(new Error('Request Timeout'))
                  setStack((prev) => {
                    const newStack = { ...prev }
                    delete newStack[key]
                    return newStack
                  })
                }, 10000)
              }}
              onLoadEnd={() => {
                console.log(`load end: ${url}`)
                clearTimeout(timerRef.current)
              }}
              onLoad={() => {
                console.log(`load: ${url}`)
                const script = scriptsToInject.current.shift()
                if (script) {
                  ref.current.injectJavaScript(script)
                }
              }}
              onMessage={(event) => {
                if (event.nativeEvent.data) {
                  const data = JSON.parse(event.nativeEvent.data)
                  // console.log('response data', data)
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
  manager.fetch = fetcher

  return (
    <View>
      {Object.entries(stack).map(([key, Compo]) => (
        <Compo key={key} />
      ))}
    </View>
  )
}
