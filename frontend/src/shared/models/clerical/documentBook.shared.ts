import type {
  GetBooksBookTypesEnum,
  GetBooksStatusEnum,
  GetRegisterKeepNumbersStatusEnum
} from '@/shared/services/api'
import type { TCommonGetListParams } from '../common'

export type TDocumentBookPayload = {
  unitId: string
  status: GetBooksStatusEnum
  bookTypes?: Array<GetBooksBookTypesEnum>
}

export type TGetRegisterNumberPayload = TCommonGetListParams & {
  unitId?: string
  status?: GetRegisterKeepNumbersStatusEnum
  documentBookId?: string
}
