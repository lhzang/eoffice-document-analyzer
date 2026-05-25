import { http, HttpResponse } from 'msw'

import { appConfig } from '@/config/app-config'
import { withAuth } from '@/shared/mocks/middleware'

import { dataMockPendingReceive, dataMockToProcessInDoc } from './dataIDWaitForReview'
import { dataListAbleToDistributeUnits, dataMockDocumentCreated } from './mockData'

import { DEFAULT_PAGE_SIZE } from '@/shared/constants/common'
import type { IInDocumentDetail, TDocumentCreated } from '../models/types'

type TResponseInDoc = PageEdocDTO & {
  data: IInDocumentDetail[]
}

export const handlers = [
  ///in doc
  http.get(
    `${appConfig.VITE_API_SERVER}/api/in-documents/toProcess`,
    withAuth(async ({ request }) => {
      const url = new URL(request.url)
      const params = new URLSearchParams(url.search)

      const payload = Object.fromEntries(params)

      let newData: any[] = []
      console.log(payload, 'payloadpayloadpayload')
      const page = Number(payload.page) ?? 1
      const pageSize = Number(payload.size) ?? DEFAULT_PAGE_SIZE
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize

      delete payload.page
      delete payload.size
      if (Object.keys(payload)?.length === 0) newData = dataMockToProcessInDoc
      else
        newData = dataMockToProcessInDoc.filter((doc) =>
          Object.entries(payload).every(([key, value]) => {
            if (!value || value === '') return true
            if (key === 'termId' && value) return true
            if (key === 'search' && value)
              return doc?.shortDescription?.toLowerCase()?.includes(value.toLowerCase())
            // if (key === 'arrivalDate' && value) return value.includes(doc.arrivalDate as string)
            // return doc[key as keyof EdocDTO] === value
          })
        )
      const response: any = {
        content: newData.slice(startIndex, endIndex),
        number: page,
        size: pageSize,
        totalPages: Math.ceil(newData.length / pageSize),
        totalElements: newData.length
      }
      console.log(response, 'newDatanewDatanewData')
      return HttpResponse.json(response, { status: 200 })
    })
  ),
  http.get(
    `${appConfig.VITE_API_SERVER}/api/in-documents/revoked`,
    withAuth(async ({ request }) => {
      const url = new URL(request.url)
      const params = new URLSearchParams(url.search)

      const payload = Object.fromEntries(params)

      let newData: ListDocumentDTO[] = []
      const page = Number(payload.page) ?? 1
      const pageSize = Number(payload.size) ?? DEFAULT_PAGE_SIZE
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize

      delete payload.page
      delete payload.size
      if (Object.keys(payload)?.length === 0) newData = dataMockToProcessInDoc
      else
        newData = dataMockToProcessInDoc.filter((doc) =>
          Object.entries(payload).every(([key, value]) => {
            if (!value || value === '') return true
            if (key === 'termId' && value) return true
            if (key === 'search' && value)
              return doc?.shortDescription?.toLowerCase()?.includes(value.toLowerCase())
          })
        )

      const response: PageListDocumentDTO = {
        content: newData.slice(startIndex, endIndex),
        number: page,
        size: pageSize,
        totalPages: Math.ceil(newData.length / pageSize),
        totalElements: newData.length
      }
      return HttpResponse.json(response, { status: 200 })
    })
  ),
  http.get(
    `${appConfig.VITE_API_SERVER}/api/in-documents/pending-receive`,
    withAuth(async ({ request }) => {
      const url = new URL(request.url)
      const params = new URLSearchParams(url.search)

      const payload = Object.fromEntries(params)

      let newData: DocumentDTO[] = []
      const page = Number(payload.page) ?? 1
      const pageSize = Number(payload.size) ?? DEFAULT_PAGE_SIZE
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize

      delete payload.page
      delete payload.size
      if (Object.keys(payload)?.length === 0) newData = dataMockPendingReceive
      else
        newData = dataMockPendingReceive.filter((doc) =>
          Object.entries(payload).every(([key, value]) => {
            if (!value || value === '') return true
            if (key === 'search' && value)
              return doc?.shortDescription?.toLowerCase()?.includes(value.toLowerCase())
          })
        )

      const response: PageDocumentDTO = {
        content: newData.slice(startIndex, endIndex),
        number: page,
        size: pageSize,
        totalPages: Math.ceil(newData.length / pageSize),
        totalElements: newData.length
      }
      return HttpResponse.json(response, { status: 200 })
    })
  ),
  http.get(
    `${appConfig.VITE_API_SERVER}/api/in-documents/created`,
    withAuth(async ({ request }) => {
      const url = new URL(request.url)
      const params = new URLSearchParams(url.search)

      const payload = Object.fromEntries(params)

      let newData: TDocumentCreated[] = []
      const page = Number(payload.page) ?? 1
      const pageSize = Number(payload.size) ?? DEFAULT_PAGE_SIZE
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize

      delete payload.page
      delete payload.size
      if (Object.keys(payload)?.length === 0) newData = dataMockDocumentCreated
      else
        newData = dataMockDocumentCreated.filter((doc) =>
          Object.entries(payload).every(([key, value]) => {
            if (!value || value === '') return true
            if (key === 'search' && value)
              return doc?.shortDescription?.toLowerCase()?.includes(value.toLowerCase())
          })
        )

      const response: PageDocumentDTO = {
        content: newData.slice(startIndex, endIndex),
        number: page,
        size: pageSize,
        totalPages: Math.ceil(newData.length / pageSize),
        totalElements: newData.length
      }
      return HttpResponse.json(response, { status: 200 })
    })
  ),
  http.get(
    `${appConfig.VITE_API_SERVER}/api/in-documents/:id/detail`,
    withAuth(async ({ request }) => {
      return HttpResponse.json(dataMockDocumentCreated[0], { status: 200 })
    })
  ),
  http.post(
    `${appConfig.VITE_API_SERVER}/api/in-documents/:id/receive`,
    withAuth(async ({ request }) => {
      return new HttpResponse(null, { status: 200 })
    })
  ),
  http.get(
    `${appConfig.VITE_API_SERVER}/api/in-documents/list-distribute-unit`,
    withAuth(async ({ request }) => {
      return HttpResponse.json(dataListAbleToDistributeUnits, { status: 200 })
    })
  )
]
