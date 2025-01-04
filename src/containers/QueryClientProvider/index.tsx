import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

import { stateStorage } from '@/utils/storage'
import ApiError from '@/utils/v2ex-client/ApiError'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      // gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: (failCount, err) => {
        if (
          [
            '2FA_ENABLED',
            'NOT_FOUND',
            'NOT_ALLOWED',
            'RESOURCE_ERROR',
            'MEMBER_LOCKED',
          ].includes((err as ApiError).code)
        ) {
          return false
        }
        return failCount < 3
      },
    },
  },
})

const localStoragePersister = createSyncStoragePersister({
  storage: stateStorage,
})
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: Infinity,
})

export default function Provider(props) {
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  )
}
