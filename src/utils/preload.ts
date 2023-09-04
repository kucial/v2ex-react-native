import deepmerge from 'deepmerge'
import { mutate } from 'swr'
import { cache, SWRGlobalState } from 'swr/_internal'
import { unstable_serialize } from 'swr/infinite'

import { getTopicReplies } from '@/utils/v2ex-client'

export const inifinitePreload = (getKey, fetcher) => {
  const key = unstable_serialize(getKey)
  const [, , , PRELOAD] = SWRGlobalState.get(cache)
  if (PRELOAD[key]) return PRELOAD[key]
  const req = fetcher(getKey(0)).then((res) => [res])
  PRELOAD[key] = req
  return req
}

export const preloadTopicInfo = (id) => {
  inifinitePreload(
    (index) => [`/page/t/:id/replies.json`, id, index + 1],
    async ([_, id, page]) => {
      const data = await getTopicReplies({ id, p: page })
      if (data.meta?.topic) {
        mutate(
          [`/page/t/:id/topic.json`, id],
          (prev = {}) =>
            deepmerge(prev, data.meta.topic, {
              arrayMerge: (a, b) => b,
            }),
          {
            revalidate: false,
          },
        )
      }
      return data
    },
  )
}
