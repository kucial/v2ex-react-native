import { useEffect, useState } from 'react'

import { useCachedState } from '@/utils/hooks'
import * as v2exClient from '@/utils/v2ex-client'

import { useAlertService } from '../AlertService'
import PrepareWebview from './PrepareWebview'
import Status from './Status'

const CACHE_KEY = '$app$/fetch-ready'

// 用于处理 v2ex.com CF 认证的问题
import { PrepareStatus } from './type'

export default function FetchPrepare(props) {
  const [tag, setTag] = useCachedState<PrepareStatus>(CACHE_KEY, 'none')
  const alert = useAlertService()
  const [state, setState] = useState({
    status: tag,
    count: 0,
    error: null,
  })

  useEffect(() => {
    const unsubscribe = v2exClient.subscribe('should_prepare_fetch', () => {
      setTag('none')
      setState((prev) => ({
        ...prev,
        error: null,
        status: 'none',
      }))
    })

    return unsubscribe
  }, [])
  useEffect(() => {
    const unsubscribe = v2exClient.subscribe('warn_vpn_status', () => {
      alert.show({
        type: 'error',
        message: 'VPN 连接状态异常，无法通过 cloudflare 检测',
      })
    })
    return unsubscribe
  }, [])

  return (
    <>
      {state.status !== 'ready' && (
        <PrepareWebview
          key={state.count}
          onUpdate={(status, err) => {
            switch (status) {
              case 'error':
                setState((prev) => ({
                  ...prev,
                  status: 'error',
                  error: err,
                }))
                break
              default:
                setState((prev) => ({
                  ...prev,
                  status,
                }))
            }
            if (status == 'ready') {
              setTag('ready')
            }
          }}
        />
      )}

      {state.status === 'ready' ? (
        props.children
      ) : (
        <Status
          error={state.error}
          status={state.status}
          onRetry={() => {
            setState((prev) => ({
              status: 'none',
              error: null,
              count: prev.count + 1,
            }))
          }}
        />
      )}
    </>
  )
}
