import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import type { TUrgentLevel } from '@/shared/constants/document'
import { MSG_REQUIRED_FIELD } from '@/shared/constants/message-text'
import {
  commonSelectSchema,
  optionalStringSchema,
  requireStringSchema
} from '@/shared/schemas/commonSchema'
import type { DocumentTypeVM, ListDocumentBooksVM } from '@/shared/services/api'
import { z } from 'zod'

export const addInternetDocument = z.object({
  documentBook: z.custom<TCommonSelectOptions<ListDocumentBooksVM>>(
    (val) => {
      return val !== null && val !== undefined
    },
    { message: MSG_REQUIRED_FIELD }
  ),
  documentType: z.custom<TCommonSelectOptions<DocumentTypeVM>>(
    (val) => {
      return val !== null && val !== undefined
    },
    { message: MSG_REQUIRED_FIELD }
  ),
  inOrdinal: z.number({
    error: MSG_REQUIRED_FIELD
  }),
  arrivalDate: z.date({ error: MSG_REQUIRED_FIELD }),
  documentCode: requireStringSchema,
  issuedDate: z.date().optional().nullable(),
  priority: commonSelectSchema,
  dueDate: z.date().optional().nullable(),
  issuer: requireStringSchema,
  shortDescription: requireStringSchema,
  description: optionalStringSchema,
  signerName: optionalStringSchema,
  signerPosition: optionalStringSchema,
  mainFilePath: optionalStringSchema,
  annexesPath: z.array(z.string().trim()).optional()
})

export const updateXroadDocumentSchema = z.object({
  issuedDate: z.date().optional().nullable(),
  arrivalDate: z.date({ error: MSG_REQUIRED_FIELD }),
  priority: z.custom<TCommonSelectOptions<TUrgentLevel>>(
    (val) => {
      return val !== null && val !== undefined
    },
    { message: MSG_REQUIRED_FIELD }
  ),
  dueDate: z.date().optional().nullable(),
  issuedUnit: requireStringSchema,
  subject: requireStringSchema,
  description: optionalStringSchema,
  signerName: optionalStringSchema,
  signerPosition: optionalStringSchema,
  mainFilePath: optionalStringSchema,
  annexesPath: z.array(z.string().trim()).optional()
})
