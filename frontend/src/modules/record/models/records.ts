import type { Pageable } from '@/shared/services/api'

// export type TGetListRecordParams = Partial<TCommonGetListParams>
export interface TGetListRecordParams extends Omit<Pageable, 'sort'> {
  sort?: string[]
  search?: string
}
