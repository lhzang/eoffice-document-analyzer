import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import type { TUnitSelectValue } from '@/shared/models/organization/unit'
import type { TNumberRegisterStatus } from '../constants/keepNumber'

export type TRegistedNumberFilter = {
  ownBookUnit?: TUnitSelectValue | null
  documentBook?: TCommonSelectOptions<string>[]
  status?: TCommonSelectOptions<TNumberRegisterStatus>[]
  search?: string
}
