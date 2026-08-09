export type SearchParams = {
  q: string
  gte?: number
  lte?: number
  node?: string
  username?: string
  sort?: string
  order?: string
}

export type SearchHistoryService = {
  records: SearchParams[]
  addRecord: (record: SearchParams) => void
  clear: () => void
}
