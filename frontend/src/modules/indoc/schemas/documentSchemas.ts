import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import type { TUrgentLevel } from '@/shared/constants/document'
import { MSG_REQUIRED_FIELD, MSG_REQUIRED_FILE } from '@/shared/constants/message-text'
import { requireStringSchema, unitSchema } from '@/shared/schemas/commonSchema'
import type { DocumentBookDetailVM } from '@/shared/services/api'
import z from 'zod'

export const createPaperIDSchema = z.object({
  documentBook: z.custom<TCommonSelectOptions<DocumentBookDetailVM>>(
    (val) => {
      return val !== null && val !== undefined
    },
    { message: MSG_REQUIRED_FIELD }
  ),
  documentType: z.custom<TCommonSelectOptions<string>>(
    (val) => {
      return val !== null && val !== undefined
    },
    { message: MSG_REQUIRED_FIELD }
  ),
  priorityLevel: z.custom<TCommonSelectOptions<TUrgentLevel>>(
    (val) => {
      return val !== null && val !== undefined
    },
    { message: MSG_REQUIRED_FIELD }
  ),
  inOrdinal: z
    .string({ message: MSG_REQUIRED_FIELD })
    .min(1, { message: MSG_REQUIRED_FIELD })
    .refine(
      (value) => /^\d+$/.test(value),
      { message: 'Số đến không hợp lệ. Vui lòng nhập lại.' }
    ),
  inDate: z.date({
    message: MSG_REQUIRED_FIELD
  }),
  dueDate: z.date().optional().nullable(),
  issueDate: z.date().optional().nullable(),
  issueUnit: unitSchema,
  attachmentFile: z.file({ error: MSG_REQUIRED_FILE }),
  appendixFiles: z.array(z.instanceof(File)).optional(),
  documentCode: z.string({ message: MSG_REQUIRED_FIELD }).refine(
    (value) => {
      const [codeNum, codeNotation] = value?.trim()?.split('/')
      return codeNum && codeNotation?.length
    },
    { error: 'Số hiệu văn bản không hợp lệ' }
  ),
  signerRole: z.string().optional(),
  signerName: z.string().optional(),
  description: requireStringSchema,
  note: z.string().optional(),
  signAttachment: z.boolean(),
  signAppendix: z.boolean(),
  affectedTenant: z.custom<TCommonSelectOptions<string>>(
    (val) => {
      return val !== null && val !== undefined
    },
    { message: MSG_REQUIRED_FIELD }
  )
})
