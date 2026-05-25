import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import { IMG_FILE_TYPE } from '@/shared/constants/document'
import {
  MSG_FILE_WRONG_FORMAT,
  MSG_PLEASE_SELECT,
  MSG_REQUIRED_FILE,
  MSG_WRONG_FORMAT
} from '@/shared/constants/message-text'
import type { TSignProvider } from '@/shared/constants/sign'
import type { TSignProviderValue } from '@/shared/models/sign'
import {
  optionalUnitSchema,
  positiveNaturalNumberSchema,
  requireStringSchema
} from '@/shared/schemas/commonSchema'
import z from 'zod'

export const providerConfigSchema = z.object({
  providerName: z.custom<TCommonSelectOptions<TSignProvider>>(
    (val) => {
      return val !== null && val !== undefined
    },
    { message: MSG_PLEASE_SELECT }
  ),
  stampImg: z
    .file({ error: MSG_REQUIRED_FILE })
    .mime([IMG_FILE_TYPE], { error: MSG_FILE_WRONG_FORMAT }),
  accountId: requireStringSchema
})

export const unitInfoSchema = z.object({
  abbr: requireStringSchema,
  parentId: z.string().optional().nullable(),
  groupId: z.string().optional().nullable(),
  clericalUnit: optionalUnitSchema,
  axisOrgId: z.string().optional().nullable(),
  name: requireStringSchema,
  address: z.string().optional().nullable(),
  rank: positiveNaturalNumberSchema,
  email: z.string().email({ error: MSG_WRONG_FORMAT }).optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable().or(z.literal('')),
  fax: z.string().optional().nullable(),
  defaultSigningProvider: z.custom<TCommonSelectOptions<TSignProviderValue>>(),
  head: z.custom<TCommonSelectOptions<string>>(),
  deputy: z.array(z.custom<TCommonSelectOptions<string>>()),
  logo: z.file().optional().nullable()
})

export const unitCreateSchema = z.object({
  name: requireStringSchema,
  abbr: requireStringSchema,
  parentId: z.string().optional(),
  shouldCreateBSign: z.boolean().optional(),
  address: z.string().optional().nullable(),
  axisOrgId: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  rank: positiveNaturalNumberSchema,
  logo: z.file().optional().nullable(),
  clericalUnitId: z.string().optional(),
  groupId: z.string().optional().nullable()
})
