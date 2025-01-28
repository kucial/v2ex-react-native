export type SearchParams = {
  q: string
  gte?: number
  lte?: number
  node?: string
  username?: string
  sort?: string
  order?: string
}

export type SearcHistorySerivce = {
  records: SearchParams[]
  addRecord: (record: SearchParams) => void
  clear: () => void
}
