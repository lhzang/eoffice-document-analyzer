import type { PaginateData } from '@/shared/models/common'
import { GET } from '../config/axiosClient'
import type { ApiSignedDoc } from '../model/types'

export const esignService = {
  getSignedHistory: async (page: number, pageSize: number): Promise<PaginateData<ApiSignedDoc>> => {
    const data = await GET(`/api/signing-history/transactions`, { page, pageSize }) as{
      docs: ApiSignedDoc[]
      page: number
      pageSize: number
      pageCount: number
      docCount: number
    }
    return {
      content: data.docs || [],
      number: data.page,
      size: data.pageSize,
      totalPages: data.pageCount,
      totalElements: data.docCount
    } 
  }
}
