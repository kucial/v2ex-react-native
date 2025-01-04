import { queryClient } from '@/containers/QueryClientProvider'
import { getTopicReplies } from '@/utils/v2ex-client'

export const preloadTopicInfo = (id) => {
  const fetchTopicReplies = async ({ pageParam }) => {
    const data = await getTopicReplies({ id, p: pageParam })
    if (data.meta?.topic) {
      queryClient.setQueryData(
        [[`/page/t/:id/topic.json`, id]],
        data.meta.topic,
      )
    }
    return data
  }
  queryClient.prefetchInfiniteQuery({
    queryKey: [`/page/t/:id/replies.json`, id],
    queryFn: fetchTopicReplies,
    initialPageParam: 1,
    getNextPageParam(lastPage) {
      if (
        lastPage.pagination &&
        lastPage.pagination.total > lastPage.pagination.current
      ) {
        return lastPage.pagination.current + 1
      }
      return undefined
    },
  })
}
