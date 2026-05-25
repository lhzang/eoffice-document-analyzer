import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import { MSG_REQUIRED_FIELD } from '@/shared/constants/message-text'
import { optionalStringSchema, requireStringSchema } from '@/shared/schemas/commonSchema'
import type { DocumentBookDetailVM } from '@/shared/services/api'
import z from 'zod'

export const ownBookUnitSchema = z.custom<TCommonSelectOptions<string>>(
  (val) => {
    return val !== null && val !== undefined
  },
  { message: MSG_REQUIRED_FIELD }
)

export const registerODNumSchema = z.object({
  documentBook: z.custom<TCommonSelectOptions<DocumentBookDetailVM>>(
    (val) => {
      return val !== null && val !== undefined
    },
    { message: MSG_REQUIRED_FIELD }
  ),
  keptNumber: z.string().optional(),
  registerNumber: requireStringSchema,
  ownBookUnit: ownBookUnitSchema,
  reason: requireStringSchema,
  title: optionalStringSchema
})
