import { appConfig } from '@/config/app-config'
import type { AxiosError } from 'axios'
import { pick } from 'lodash-es'
import { ToastEventBus, type ToastMessageOptions } from 'primevue'
import {
  APP_NOTI_TIME,
  APP_PAGE_SIZE,
  APP_SORT_ORDERS,
  DEGREES,
  GENDER_OPTIONS
} from '../constants/common'
import type { THttpProblemDetails, TResponseListData, TValidEnv } from '../models/common'
import type { PaginateData } from '../models/types'
import { useUserProfileStore } from '../stores/userProfileStore'

export function isOverflowing(element: HTMLElement): boolean {
  return element.scrollHeight > element.clientHeight
}

export function isEmptyValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' &&
      !(value instanceof Date) &&
      value !== null &&
      !(value instanceof File) &&
      Object.keys(value).length === 0)
  )
}

export const isExist = (value: unknown) => {
  if (typeof value === 'boolean') return true
  if (typeof value === 'number') return true
  if (!value) return false
  return Object.keys(value).length > 0
}

export function cleanObject<T extends object>(obj: T): T {
  for (const propName in obj) {
    if (isEmptyValue(obj[propName])) {
      delete obj[propName]
    }
  }
  return obj
}

export const getShortName = (text: string = ''): string =>
  text.split(' ').reduce((acc, crr) => {
    if (!!crr) acc += crr.charAt(0).toUpperCase()
    return acc
  }, '')

export const capitalizeText = (text: string = ''): string =>
  text.split(' ').reduce((acc, crr) => {
    if (!!crr) acc += crr.charAt(0).toUpperCase() + crr.substring(1)
    return acc
  }, '')

function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error
}

// export function parseToAppError(error: unknown): AppError {
//   if (isAxiosError(error)) {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const axiosError = error as AxiosError<any>
//     return {
//       code: axiosError.response?.status ?? APP_STATUS_ERROR.INTERNAL_ERROR.code,
//       message: axiosError.response?.data?.message || axiosError.message
//     }
//   } else
//     return {
//       code: APP_STATUS_ERROR?.INTERNAL_ERROR.code,
//       message: 'Unknown error occurred'
//     }
// }

// export async function withAppError<T>(fn: () => Promise<T>): Promise<T> {
//   try {
//     return await fn()
//   } catch (e) {
//     throw parseToAppError(e) as AppError
//   }
// }

export function useToastEvtBus() {
  return {
    add: (message: ToastMessageOptions) => {
      ToastEventBus.emit('add', message)
    },
    remove: (message: ToastMessageOptions) => {
      ToastEventBus.emit('remove', message)
    },
    removeGroup: (group: string) => {
      ToastEventBus.emit('remove-group', group)
    },
    removeAllGroups: () => {
      ToastEventBus.emit('remove-all-groups')
    }
  }
}

export const toastSucceed = (messageOptions: Omit<ToastMessageOptions, 'severity'>) => {
  const toast = useToastEvtBus()
  toast.add({
    severity: 'success',
    summary: 'Thành công',
    life: APP_NOTI_TIME,
    ...messageOptions
  })
}
export const toastError = (messageOptions: Omit<ToastMessageOptions, 'severity'>) => {
  const toast = useToastEvtBus()
  toast.add({
    severity: 'error',
    summary: 'Thất bại',
    life: APP_NOTI_TIME,
    ...messageOptions
  })
}

export const toastWarning = (messageOptions: Omit<ToastMessageOptions, 'severity'>) => {
  const toast = useToastEvtBus()
  toast.add({
    severity: 'warn',
    summary: 'Thất bại',
    life: APP_NOTI_TIME,
    ...messageOptions
  })
}

export function notifyError(error: AxiosError<THttpProblemDetails>, fallbackMessage: string) {
  const toast = useToastEvtBus()
  toast.add({
    severity: 'error',
    life: APP_NOTI_TIME,
    summary: 'Thất bại',
    detail: error?.response?.data?.detail ?? error?.message ?? fallbackMessage
  })
}

export function mappingServerPaginatedData<T>(data: PaginateData<T>): TResponseListData<T> {
  return {
    docs: data.items ?? ([] as T[]),
    page: data.pageNumber ?? 0,
    pageSize: data.pageSize ?? APP_PAGE_SIZE,
    pageCount: data.totalPages ?? 0,
    docCount: data.totalItems ?? 0
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toQueryParams(obj: Record<string, any>): Record<string, string> {
  const query: Record<string, string> = {}
  for (const key in obj) {
    const val = obj[key]

    if (val === undefined || val === null) continue

    // Reference type → stringify
    if (typeof val === 'object') {
      query[key] = JSON.stringify(val)
    } else {
      query[key] = String(val)
    }
  }

  return query
}

export function safeParseJson<T = unknown>(value: unknown): T | unknown {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      // Not valid JSON, return original
      return value
    }
  }

  // Not a string, return original
  return value
}

export function getKeysFromType<T extends Record<string, unknown>>() {
  return Object.keys({} as T) as (keyof T)[]
}

export const getNumberSortOrderValue = (stringOrderSortValue?: string) =>
  stringOrderSortValue === APP_SORT_ORDERS.asc
    ? 1
    : stringOrderSortValue === APP_SORT_ORDERS.desc
      ? -1
      : 0

export const getStringSortOrderValue = (numberOrderSortValue: number) => {
  if (numberOrderSortValue === 1) return APP_SORT_ORDERS.asc
  if (numberOrderSortValue === -1) return APP_SORT_ORDERS.desc
  return
}

export const checkMatchEnv = (envNames: TValidEnv[]) => envNames?.includes(appConfig.VITE_ENV_NAME)

export function createAvatarData(name: string): { label: string; color: string } {
  const parts = name?.trim().split(' ')
  const label = (parts?.[0]?.[0] || '' + (parts?.[parts?.length ?? 1 - 1]?.[0] || '')).toUpperCase()

  let hash = 0
  for (let i = 0; i < name?.length; i++) {
    hash = name?.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hash % 360
  const color = `hsl(${hue}, 70%, 50%)`

  return { label, color }
}

export function displayedAvatars(
  assignees: string[],
  max: number = 3
): { label: string; color: string }[] {
  const avatars = assignees.map(createAvatarData)
  if (avatars.length <= max) return avatars
  const extraCount = avatars.length - max
  return [...avatars.slice(0, max), { label: `+${extraCount}`, color: '#999' }]
}

export function pickStrict<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return pick(obj, keys) as Pick<T, K>
}

export function toBracketPath(path: string) {
  // replace every `.number` that is followed by . or end-of-string with [number]
  return path.replace(/\.([0-9]+)(?=\.|$)/g, '[$1]')
}

export function getError(errors: Record<string, unknown> | undefined, dotPath: string) {
  if (!errors) return undefined
  const bracketPath = toBracketPath(dotPath)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (errors as any)[dotPath] ?? (errors as any)[bracketPath]
}

export const extractFileExtFromName = (fileName: string) => {
  return fileName?.split('.').pop()?.toLowerCase()
}

export const getFullFileUrl = (relative: string) =>
  `${appConfig.VITE_API_SERVER}/api/files${relative}`
export const handleGetGenderOpts = () => ({ options: GENDER_OPTIONS, hasMore: false })

export const genDegreeOptions = () => {
  return {
    options: DEGREES,
    hasMore: false
  }
}

export const downLoadDocumentFileViaUrl = async (url: string, fileNameWithExtension?: string) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${useUserProfileStore().accessToken}`
    }
  })
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = fileNameWithExtension || 'file'
  a.click()
  URL.revokeObjectURL(objectUrl)
}

export async function createFileFromUrl(url: string, fileName?: string): Promise<File> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${useUserProfileStore().accessToken}`
    }
  })
  if (!res.ok) {
    let errorMessage = 'Có lỗi khi lấy file'

    try {
      const data = await res.json()
      errorMessage = data?.message || data?.detail || JSON.stringify(data)
    } catch {
      errorMessage = await res.text()
    }

    throw new Error(errorMessage)
  }

  const blob = await res.blob()
  const name = fileName ?? decodeURIComponent(url.split('/').pop() || 'file')

  return new File([blob], name, { type: blob.type })
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function remapAccendingSequentialIndexes<T extends Record<string, any>>(
  list: T[],
  fieldName: keyof T
): T[] {
  const map = new Map<number, number>()
  let next = 1
  try {
    const sortedList = [...list].sort((a, b) => a?.[fieldName] - b?.[fieldName])
    return sortedList.map((item) => {
      const original = item[fieldName]

      if (typeof original !== 'number') {
        throw new Error(
          `Field '${String(fieldName)}' is not a number on item: ${JSON.stringify(item)}`
        )
      }

      if (!map.has(original)) {
        map.set(original, next++)
      }

      const newIndex = map.get(original)!

      return {
        ...item,
        [fieldName]: newIndex
      }
    })
  } catch (e) {
    return list
  }
}

export const fetchImageWithAuth = async (url: string) => {
  url = encodeURI(url)
  console.log('Fetching image with auth:', url)
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${useUserProfileStore().accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch image')
  }

  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

export const getFileName = (path: string, keepPostfix?: boolean) => {
  if (!path) return ''
  const fileName = path.split('/').pop() || ''
  if (keepPostfix) return fileName
  const parts = fileName.split('-')
  if (parts.length > 1) {
    const removedPart = parts.pop()
    const extension = removedPart?.split('.')?.pop() ?? ''
    return parts?.join('-').concat(extension ? `.${extension}` : '')
  } else return parts?.[0]
}

export const handleBufferResponseError = (error: AxiosError<Error>) => {
  const decoder = new TextDecoder('utf-8')
  error.response.data = safeParseJson(decoder.decode(error?.response?.data)) as Error
  throw error
}

export const handlePrintFile = async (input: string | File | Blob) => {
  try {
    if (!input) return toastError({ detail: 'Không có file' })

    let fileUrl: string

    if (typeof input === 'string') {
      const res = await fetch(input, {
        headers: {
          Authorization: `Bearer ${useUserProfileStore().accessToken}`
        }
      })
      const blob = await res.blob()
      fileUrl = URL.createObjectURL(blob)
    } else {
      // File or Blob
      fileUrl = URL.createObjectURL(input)
    }

    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = fileUrl
    document.body.appendChild(iframe)

    iframe.onload = () => {
      const win = iframe.contentWindow
      if (!win) return

      win.focus()
      win.print()

      win.onafterprint = () => {
        URL.revokeObjectURL(fileUrl)
        iframe.remove()
      }
    }
  } catch (e) {
    throw e
  }
}
