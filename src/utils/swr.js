export const isRefreshing = (swrState) => {
  // once fetched  && isValidating
  return (swrState.data || swrState.error) && swrState.isValidating
}

export const hasReachEnd = (listSwr) => {
  if (!listSwr.data?.length) {
    return false
  }
  const pagination = listSwr.data[0].pagination || { total: 1 }
  if (pagination.total > listSwr.size) {
    return false
  }
  return true
}
