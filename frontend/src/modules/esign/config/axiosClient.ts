import { appConfig } from '@/config/app-config'
import { useAuth } from '@/shared/composables/useAuth'
import { APP_STATUS_ERROR } from '@/shared/constants/common'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'

// Gọi api Bsign = axios

type ResponseError = {
  detail: string[]
  message: string
}
const apiService = axios.create({
  baseURL: appConfig.VITE_ESIGN_API_SERVER,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

apiService.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError<ResponseError>) => {
    if (error.response?.status === APP_STATUS_ERROR.UNAUTHORIZED.code) {
      useAuth().logout()
    }
    return Promise.reject<ResponseError>({
      message: error?.message,
      status: {
        code: error.response?.status ?? 500
      }
    })
  }
)

apiService.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useUserProfileStore().accessToken
    if (token) {
      if (config.headers instanceof AxiosHeaders) {
        config.headers.set('Authorization', `Bearer ${token}`)
      } else {
        config.headers = new AxiosHeaders()
        config.headers.set('Authorization', `Bearer ${token}`)
      }
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

interface RequesOptions extends AxiosRequestConfig {
  isFullPath?: boolean
  urlPath?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = async <Response, Params extends Record<string, any>>(
  path: string,
  params?: Params,
  options: RequesOptions = {}
): Promise<Response> => {
  const _params = params
    ? Object.keys(params)
        .map((key) => {
          let valueParam = params[key]
          let adjustParam = ''
          if (Array.isArray(valueParam)) {
            adjustParam = valueParam
              .map(
                (paramDetail) =>
                  `${key}=${encodeURIComponent(paramDetail !== 'all' ? paramDetail : '')}`
              )
              .join('&')
          } else {
            valueParam = valueParam !== 'all' ? valueParam : ''
            adjustParam = `${key}=${encodeURIComponent(valueParam)}`
          }
          return adjustParam
        })
        .join('&')
    : ''
  const _url =
    (options.isFullPath ? path : appConfig.VITE_ESIGN_API_SERVER + path) +
    (_params === '' ? '' : '?' + _params)
  return apiService.get<Response>(_url, options).then((response) => response.data)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = async <Response, Params extends Record<string, any>>(
  path: string,
  params?: Params,
  options: RequesOptions = {}
): Promise<Response> => {
  const _url = options.isFullPath ? path : appConfig.VITE_ESIGN_API_SERVER + path
  return apiService
    .post(_url, params, options)
    .then((response) => response.data)
    .catch((error) => {
      throw error
    })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PUT = async <Response, Params extends Record<string, any>>(
  path: string,
  params?: Params,
  options: RequesOptions = {}
): Promise<Response> => {
  const _url = options.isFullPath ? path : appConfig.VITE_ESIGN_API_SERVER + path
  return apiService
    .put(_url, params, options)
    .then((response) => response.data)
    .catch((error) => {
      throw error
    })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PATCH = async <Response, Params extends Record<string, any>>(
  path: string,
  params?: Params,
  options: RequesOptions = {}
): Promise<Response> => {
  const _url = options.isFullPath ? path : appConfig.VITE_ESIGN_API_SERVER + path
  return apiService
    .patch(_url, params, options)
    .then((response) => response.data)
    .catch((error) => {
      throw error
    })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = async <Response, Params extends Record<string, any>>(
  path: string,
  params?: Params,
  options: RequesOptions = {}
): Promise<Response> => {
  const _url = options.isFullPath ? path : appConfig.VITE_ESIGN_API_SERVER + path
  const _options = options
  if (params) {
    _options.data = params
  }
  return apiService
    .delete(_url, _options)
    .then((response) => response.data)
    .catch((error) => {
      throw error
    })
}

export default apiService
