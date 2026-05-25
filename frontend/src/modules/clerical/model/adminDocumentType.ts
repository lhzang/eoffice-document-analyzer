import type { TCommonGetListParams } from '@/shared/models/common'

export type TAdminDocumentType = {
  id: string
  name: string
  shortName: string
}

export type TGetInfiniteListAdminDocType = Omit<TCommonGetListParams, 'page'>
