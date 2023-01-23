
import { pick, uniqueId } from 'lodash'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import WebView, { WebViewMessageEvent } from 'react-native-webview'
import { ONCP } from './constants'
import ApiError from './ApiError'

type RequestService = {
  isReady: boolean
  error?: Error
  webview?: WebView
  requests: Record<
    string,
    {
      resolve: (...args: any[]) => void
      reject: (...args: any[]) => void
    }
  >
  loadPromise?: Promise<void>
  reload(): void
  handleMessage(e: WebViewMessageEvent): void
  fetch(config: AxiosRequestConfig): Promise<AxiosResponse<any, any>>
}


const delay = (timeout: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })

const getRequestScript = (id: string, main: string) => `
(async function() {
try {
  const f = async () => {
    ${main}
  }
  const response = await f();
  window.ReactNativeWebView.postMessage(JSON.stringify({
    id: ${JSON.stringify(id)},
    response,
  }))
} catch (err) {
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      id: ${JSON.stringify(id)},
      error: JSON.parse(
        JSON.stringify(err, Object.getOwnPropertyNames(err))
      ),
    })
  )
}
}()); true;
`

const axiosRequestScript = (id: string, config: AxiosRequestConfig) => {
  const configToInject = pick(config, [
    'baseURL',
    'url',
    'timeout',
    'method',
    'data',
    'params',
    'headers',
  ])

  if (config.headers['Content-Type'] === 'application/json') {
    configToInject.data = JSON.parse(configToInject.data);
  }
  const script = getRequestScript(
    id,
    `
  if (!window.axios) {
    throw new Error('v2ex-client service not ready.');
  }
  const config = ${JSON.stringify(configToInject)};
  if (config.params && config.params.once === ${JSON.stringify(ONCP)}) {
    config.params.once = await fetchOnce();
  }
  if (config.data && config.data.once === ${JSON.stringify(ONCP)}) {
    config.data.once = await fetchOnce();
  }
  console.log(config);
  const res = await window.axios(config);
  let data = res.data;
  // use iframe to handle **__cf_email__**
  if (typeof data === 'string' && $(data).find('.__cf_email__').length) {
    const htmlFromIframe = (html) => {
      const frame = document.createElement('iframe');
      frame.src = "about:blank";
      document.body.appendChild(frame);
      const promise = new Promise((resolve) => {
        frame.addEventListener('load', function() {
          resolve(frame.contentDocument.body.innerHTML)
          document.body.removeChild(frame);
        });
        frame.contentWindow.document.open();
        frame.contentWindow.document.write(html);
        frame.contentWindow.document.close();
      })
      return promise;
    }
    data = await htmlFromIframe(data);
  }

  return {
    data: data,
    config: config,
  };
`,
  )
  return script
}

const customScriptGenerators = {
  ['/_custom_/once'](id: string, config: AxiosRequestConfig) {
    return getRequestScript(id, `
      const params = ${JSON.stringify(config.params)};
      if (params.refresh) {
        delete window.V2EX.once
        lscache.remove('once')
      }
      const once = await fetchOnce();
      return {
        data: once,
      };
    `)
  }
}

const customRequestScript = (id: string, config: AxiosRequestConfig) => {
  const script = customScriptGenerators[config.url](id, config)
  return script
}

const service: RequestService = {
  isReady: false,
  error: null,
  webview: null,
  requests: {},
  reload() {
    // only reload once a time....
    if (!service.error) {
      return;
    }
    service.isReady = false;
    service.error = null;
    service.webview?.reload()
    const error = new ApiError({
      code: 'REQUEST_RESET',
      message: 'Request reset due to refresh.',
    })
    Object.entries(service.requests).forEach(([key, { reject }]) => {
      reject(error)
      delete service.requests[key]
    })
  },
  handleMessage(e) {
    let msgData
    try {
      msgData = JSON.parse(e.nativeEvent.data)
    } catch (err) {
      //
    }
    if (!msgData) {
      return
    }
    const { id, response, error } = msgData
    if (response) {
      service.requests[id].resolve(response)
    } else {
      service.requests[id].reject(error)
    }
    delete service.requests[id]
  },
  async fetch(config: AxiosRequestConfig): Promise<AxiosResponse<any, any>> {
    if (service.error) {
      // TODO: better reset service.error strategy
      setTimeout(() => {
        service.reload();
      }, 300);
      throw service.error;
    }
    if (!service.isReady || !service.webview) {
      console.log('v2ex client webview service is not ready....');
      let initTime = Date.now();
      let count = 0;
      while (true) {
        console.log('...loading...', count);
        if (service.loadPromise) {
          await service.loadPromise
        } else {
          await delay(1000)
        }
        if (service.isReady) {
          break
        }
        if (Date.now() - initTime > 1000 * 10) {
          throw new ApiError({
            code: 'WEBVIEW_TIMEOUT_OUT',
            message: 'webview service is not ready',
          })
        }
        count += 1;
      }
    }
    const id = uniqueId() + '_' + Date.now();
    return new Promise((resolve, reject) => {
      service.requests[id] = { resolve, reject }
      let script: string;
      if (config.url.startsWith('/_custom_/')) {
        script = customRequestScript(id, config)
      } else {
        script = axiosRequestScript(id, config)
      }


      service.webview.injectJavaScript(script)
    })
  },
}

export default service;