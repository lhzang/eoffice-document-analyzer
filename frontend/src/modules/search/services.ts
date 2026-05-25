import { SearchApi } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import type { TDocSearchPayload, TGetDocSearchPayload } from './models'

const searchApi = new SearchApi(apiClientConfig)
export const docSearchServices = {
  exportDocSearch: async (payload: TDocSearchPayload) => {
    const {
      search,
      documentNumber,
      sourceType,
      year,
      signer,
      creator,
      issuingUnit,
      fromDate,
      toDate,
      documentTypeIds
    } = payload
    const res = await searchApi.exportSearch(
      search,
      documentNumber,
      sourceType,
      year,
      signer,
      creator,
      issuingUnit,
      fromDate,
      toDate,
      documentTypeIds
    )
    return res?.data
  },
  getDocSearch: async (payload: TGetDocSearchPayload) => {
    const {
      pageable,
      search,
      documentNumber,
      sourceType,
      year,
      signer,
      creator,
      issuingUnit,
      fromDate,
      toDate,
      documentTypeIds
    } = payload
    const res = await searchApi.search(
      pageable,
      search,
      documentNumber,
      sourceType,
      year,
      signer,
      creator,
      issuingUnit,
      fromDate,
      toDate,
      documentTypeIds
    )
    return res?.data
  }
}
