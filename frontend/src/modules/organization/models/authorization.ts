import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import type { TAppFeatureKey } from '@/shared/constants/permission'
import type {
  TPermissionEffect,
  TPermissionScopeValue
} from '@/shared/models/organization/perrmission'
import type { TUnitSelectValue } from '@/shared/models/organization/unit'
import type { LIST_PERMISSON_SCOPES } from '../constants/authorization'

export type TPermissonScopeValue = keyof typeof LIST_PERMISSON_SCOPES

export type TPermissionValue = { permission: TAppFeatureKey; isGlobal: boolean }

export type TPermission = {
  permission: TCommonSelectOptions<TPermissionValue>
  scope: TCommonSelectOptions<TPermissionScopeValue>
  unit: TUnitSelectValue | null
  effect: TPermissionEffect
}
