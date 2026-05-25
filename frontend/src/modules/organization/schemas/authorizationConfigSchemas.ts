import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import { MSG_REQUIRED_FIELD } from '@/shared/constants/message-text'
import { APP_PERMISSION_EFFECTS } from '@/shared/constants/permission'
import type { TPermissionScopeValue } from '@/shared/models/organization/perrmission'
import {
  positiveNaturalNumberSchema,
  requireStringSchema,
  unitSchema
} from '@/shared/schemas/commonSchema'
import z from 'zod'
import type { TPermissionValue } from '../models/authorization'

export const permissionConfigSchema = z.object({
  permission: z.custom<TCommonSelectOptions<TPermissionValue>>((val) => val, {
    message: MSG_REQUIRED_FIELD
  }),
  scope: z.custom<TCommonSelectOptions<TPermissionScopeValue>>((val) => val, {
    message: MSG_REQUIRED_FIELD
  }),
  effect: z.enum(['ALLOW', 'DENY']).default(APP_PERMISSION_EFFECTS.allow),
  unit: unitSchema.nullable()
})

export const authorizationConfigSchema = z.object({
  title: requireStringSchema,
  description: requireStringSchema,
  rank: positiveNaturalNumberSchema,
  displayedAsGroup: z.boolean(),
  permissions: z.array(permissionConfigSchema)
})
