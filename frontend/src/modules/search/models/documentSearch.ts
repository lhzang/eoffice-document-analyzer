import type { SearchSourceTypeEnum } from '@/shared/services/api'

export type TDocSearchPayload = {
  sourceType: SearchSourceTypeEnum
  search?: string
  year?: string
}
