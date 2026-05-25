import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import { MSG_REQUIRED_FIELD } from '@/shared/constants/message-text'
import type { TODSignTypes } from '@/shared/constants/sign'
import {
  optionalStaffsSchema,
  optionalUnitSchema,
  requireStringSchema
} from '@/shared/schemas/commonSchema'
import z from 'zod'
import { type TDocumentTypeForSign } from './../../../shared/constants/document'

export const signFlowSchema = z.object({
  signType: z.custom<TCommonSelectOptions<TODSignTypes>>(
    (val) => {
      return val !== null && val !== undefined
    },
    { message: MSG_REQUIRED_FIELD }
  ),
  staffs: optionalStaffsSchema
})

export const createSignFlowConfigSchema = z.object({
  name: requireStringSchema,
  type: z.custom<
    TCommonSelectOptions<Extract<TDocumentTypeForSign, 'OUT_DOCUMENT' | 'INTERNAL_DOCUMENT'>>
  >(
    (val) => {
      return val !== null && val !== undefined
    },
    { message: MSG_REQUIRED_FIELD }
  ),
  appliedUnit: optionalUnitSchema,
  signFlow: z
    .array(signFlowSchema, { error: 'Vui lòng nhập trình tự ký' })
    .min(1, { error: 'Vui lòng nhập trình tự ký' })
})
