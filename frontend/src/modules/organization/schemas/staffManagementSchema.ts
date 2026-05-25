import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import { MSG_REQUIRED_FIELD, MSG_WRONG_FORMAT } from '@/shared/constants/message-text'
import type { TGender } from '@/shared/models/common'
import type { TSignProviderValue } from '@/shared/models/sign'
import {
  phoneNumberSchema,
  positiveNaturalNumberSchema,
  requireStringSchema,
  unitSchema
} from '@/shared/schemas/commonSchema'
import type { RoleVM } from '@/shared/services/api'
import z from 'zod'
import { permissionConfigSchema } from './authorizationConfigSchemas'

export const baseStaffInfoSchema = z.object({
  fullName: requireStringSchema,
  phone: phoneNumberSchema.optional().nullable(),
  gender: z.custom<TCommonSelectOptions<TGender>>().optional(),
  email: z.email({ error: MSG_WRONG_FORMAT }),
  degree: z.custom<TCommonSelectOptions<string>>().optional()
})

export const addtionnalConfigSchema = z.array(permissionConfigSchema).optional()

export const staffManagementSchema = baseStaffInfoSchema
  .extend({
    positionTitle: z.string({ error: MSG_REQUIRED_FIELD }).min(1, { error: MSG_REQUIRED_FIELD }),
    roles: z.array(z.custom<TCommonSelectOptions<RoleVM>>()),
    rank: positiveNaturalNumberSchema,
    additionalPermissions: addtionnalConfigSchema,
    startDate: z.date({ error: MSG_REQUIRED_FIELD }),
    endDate: z.date({ error: MSG_REQUIRED_FIELD }).optional().nullable(),
    defaultSigningProvider: z.custom<TCommonSelectOptions<TSignProviderValue>>()
  })
  .superRefine((data, ctx) => {
    if (data?.endDate && data?.startDate && data?.startDate > data?.endDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'Ngày kết thúc phải lớn hơn ngày bắt đầu',
        path: ['endDate']
      })
    }
  })

export const staffPermissionsConfigSchema = z
  .object({
    permissions: addtionnalConfigSchema
  })
  .superRefine((data, ctx) => {
    const list = data.permissions ?? []
    const seen = new Map<string, string>()
    const duplicates = new Set<string>()

    for (const item of list) {
      const key = [
        item.permission?.value?.permission,
        item.scope?.value,
        item.effect,
        item.unit?.id ?? 'null'
      ].join('|')

      const label = item.permission?.label ?? item.permission?.value?.permission

      if (seen.has(key)) duplicates.add(label)
      else seen.set(key, label)
    }

    if (duplicates.size > 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['permissions'],
        message: `Các quyền trùng lặp: ${[...duplicates].join(', ')}`
      })
    }
  })

export const staffInfoSchema = z.object({
  fullName: requireStringSchema,
  gender: z.custom<TCommonSelectOptions<TGender>>(),
  email: z.email({ error: MSG_WRONG_FORMAT }).optional(),
  phone: phoneNumberSchema.optional(),
  defaultSigningProvider: z.custom<TCommonSelectOptions<TSignProviderValue>>(),
  defaultPosition: z.custom<TCommonSelectOptions<string>>()
})

export const createStaffSchemaWithoutUnit = baseStaffInfoSchema.extend({
  staffUnit: z.null().default(null),
  hasUnit: z.literal(false)
})
export const createStaffSchemaWithUnit = baseStaffInfoSchema.extend({
  staffUnit: unitSchema,
  hasUnit: z.literal(true),
  positionTitle: z.string({ error: MSG_REQUIRED_FIELD }).min(1, { error: MSG_REQUIRED_FIELD }),
  roles: z.array(z.custom<TCommonSelectOptions<RoleVM>>()).optional(),
  rank: positiveNaturalNumberSchema,
  additionalPermissions: addtionnalConfigSchema,
  startDate: z.date({ error: MSG_REQUIRED_FIELD }),
  endDate: z.date({ error: MSG_REQUIRED_FIELD }).optional().nullable()
})

export const createStaffSchema = z.discriminatedUnion('hasUnit', [
  createStaffSchemaWithoutUnit,
  createStaffSchemaWithUnit
])

export const addStaffPositionIntoUnitSchema = z
  .object({
    positionTitle: z.string({ error: MSG_REQUIRED_FIELD }).min(1, { error: MSG_REQUIRED_FIELD }),
    roles: z.array(z.custom<TCommonSelectOptions<RoleVM>>())?.optional(),
    rank: positiveNaturalNumberSchema,
    additionalPermissions: addtionnalConfigSchema,
    startDate: z.date({ error: MSG_REQUIRED_FIELD }),
    endDate: z.date().optional().nullable(),
    unit: unitSchema
  })
  .superRefine((data, ctx) => {
    if (data?.endDate && data?.startDate && data?.startDate > data?.endDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'Ngày kết thúc phải lớn hơn ngày bắt đầu',
        path: ['endDate']
      })
    }
  })

export const staffPositionSchema = addStaffPositionIntoUnitSchema.safeExtend({
  unit: unitSchema
})
