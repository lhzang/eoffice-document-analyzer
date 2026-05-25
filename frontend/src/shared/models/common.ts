import type { validEnvs } from '@/config/app-config'
import type {
  DefaultError,
  DefinedInitialQueryOptions,
  MutationObserverOptions,
  QueryKey,
  UseInfiniteQueryOptions,
  UseQueryOptions
} from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import type { ColumnProps } from 'primevue'
import type { UnwrapRef } from 'vue'
import type { Pageable, PageableObject, SortObject } from '../services/api'
import { DOCUMENT_PROCESS_ROLES } from './../constants/document'

export type QueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> = Omit<
  UnwrapRef<DefinedInitialQueryOptions<TQueryFnData, TError, TData, TQueryKey>>,
  'queryKey' | 'queryFn'
>

export type QueryWithKeyOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TQueryKey extends QueryKey = QueryKey,
  TData = TQueryFnData,
  TQueryData = TQueryFnData
> = Optional<
  Omit<UnwrapRef<UseQueryOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>>, 'queryFn'>,
  'queryKey'
>

export type InfiniteQueryOptions<
  TQueryFnData,
  TError = DefaultError,
  TQueryKey extends QueryKey = QueryKey,
  TData = TQueryFnData
> = Omit<
  UnwrapRef<UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey>>,
  'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
>

export type MutationOptions<
  TData = unknown,
  TError = TServerError,
  TVariables = void,
  TContext = unknown
> = Omit<MutationObserverOptions<TData, TError, TVariables, TContext>, 'mutationKey' | 'mutationFn'>

// end query overide type

export type PaginateData<T> = {
  totalPages?: number
  totalElements?: number
  size?: number
  content?: Array<T>
  number?: number
  sort?: SortObject
  first?: boolean
  last?: boolean
  pageable?: PageableObject
  empty?: boolean
}

export type TCommonGetListPayload = {
  page?: number
  pageSize?: number
}

export type TResponseListData<T> = {
  docs: T[]
  page: number
  pageSize: number
  pageCount: number
  docCount: number
}

export type TAppTab<T = string> = {
  label: string
  value: T
}

export type TCommonGetListParams = Pageable & {
  search?: string
}

export type TCommonOptionalGetListParams = Partial<Pageable> & {
  search?: string
}

export type TCommonGetInfiniteListParams = Omit<TCommonGetListParams, 'page'>
export type TDistributeRole = (typeof DOCUMENT_PROCESS_ROLES)[keyof typeof DOCUMENT_PROCESS_ROLES]

export type TValidEnv = (typeof validEnvs)[number]

export type TCommonColumn<T> = Omit<ColumnProps, 'field'> & {
  field?: string | ((item: T) => string)
  customSlot?: string
  filterSlot?: string
  customHeaderSlot?: string
}

export type TGender = 'MALE' | 'FEMALE' | 'UNKNOWN'
export type THttpProblemDetails = {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  error_code?: string
}

export type TServerError = AxiosError<THttpProblemDetails>

export type TStaffLeaderFilterMode = 'DIRECTOR' | 'DIRECTOR_AND_VICE' | undefined
