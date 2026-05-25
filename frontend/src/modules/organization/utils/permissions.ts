import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import {
  APP_PERMISSION_LIST_LABEL,
  APP_PERMISSION_SCOPE_LABEL,
  APP_PERMISSION_SCOPES,
  type TAppFeatureKey
} from '@/shared/constants/permission'
import type { RoleVM, TenantWithNameOnlyVM } from '@/shared/services/api'
import { cleanObject } from '@/shared/utils/common'
import type { TPermission } from '../models/authorization'
import accessControlService from '../services/accessControlService'

export function isUnitAllowed(unitId: string, allowedUnits: TenantWithNameOnlyVM[]): boolean {
  return allowedUnits.some((unit) => unit.id === unitId)
}

export const genPermissionsFromRoles = (roleOpts: TCommonSelectOptions<RoleVM>[]) => {
  const hadnledPermissions: TPermission[] = []
  const selectedValuesSet = new Set<string>()
  const scopePermissions = roleOpts?.map((opt) => opt.value.scopedPermissions).flat() ?? []
  scopePermissions?.forEach((permission) => {
    const valueString = `${permission?.permission}_${permission?.isGlobal ? APP_PERMISSION_SCOPES.all : permission?.scope}_${permission?.tenant?.id}_${permission?.effect}`
    if (!selectedValuesSet?.has(valueString)) {
      hadnledPermissions.push({
        permission: {
          label:
            APP_PERMISSION_LIST_LABEL?.[permission?.permission as TAppFeatureKey] ??
            permission?.permission,
          value: {
            permission: permission?.permission as TAppFeatureKey,
            isGlobal: permission?.isGlobal
          }
        },
        scope: permission?.isGlobal
          ? {
              label: APP_PERMISSION_SCOPE_LABEL[APP_PERMISSION_SCOPES.all],
              value: APP_PERMISSION_SCOPES.all
            }
          : {
              label: APP_PERMISSION_SCOPE_LABEL?.[permission?.scope],
              value: permission?.scope
            },
        unit: permission?.tenant,
        effect: permission?.effect
      })
    }
  })
  return hadnledPermissions?.sort((a, b) =>
    a?.permission?.value?.permission?.localeCompare(b?.permission?.value?.permission)
  )
}

export const fetchRolesOptions = async (search: string, page: number) => {
  const response = await accessControlService.getListRoles(
    cleanObject({
      search,
      page,
      size: 20
    })
  )
  const { docs, page: currentPage, pageCount } = response

  return {
    options: docs.map((role) => ({ value: role, label: role.title })),
    hasMore: currentPage < pageCount
  }
}
