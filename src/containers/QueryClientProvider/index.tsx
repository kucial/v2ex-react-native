import { useTanStackQueryDevTools } from '@rozenite/tanstack-query-plugin'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

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

const localStoragePersister = createAsyncStoragePersister({
  storage: stateStorage,
})

export default function Provider(props) {
  useTanStackQueryDevTools(queryClient)
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: localStoragePersister,
        maxAge: Infinity,
      }}
    >
      {props.children}
    </PersistQueryClientProvider>
  )
}
