export type TResponseListData<T> = {
  docs: T[]
  page: number
  pageSize: number
  pageCount: number
  docCount: number
}

export type PaginateData<T> = {
  totalPages?: number
  totalItems?: number
  pageSize?: number
  pageNumber?: number
  items?: Array<T>
}
