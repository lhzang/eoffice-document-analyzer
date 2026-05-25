import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import { type TUrgentLevel } from '@/shared/constants/document'
import { MSG_PLEASE_SELECT, MSG_REQUIRED_FILE } from '@/shared/constants/message-text'
import type { FilesBySource } from '@/shared/models/document'
import type { TFormSelectDestinationValue } from '@/shared/models/outDoc/destination'
import { optionalStringSchema, requireStringSchema } from '@/shared/schemas/commonSchema'
import { signFlowSchema } from '@/shared/schemas/signFlowSchema'
import type { DocumentType, FlowSignTemplateVM } from '@/shared/services/api'
import z from 'zod'
import type { TDocProcessType } from '../constants/documents'

export const createInternalDocSchema = z.object({
  documentType: z.custom<TCommonSelectOptions<Pick<DocumentType, 'id' | 'name' | 'shortName'>>>(
    (val) => {
      return val !== null && val !== undefined
    },
    { message: MSG_PLEASE_SELECT }
  ),
  processType: z.custom<TCommonSelectOptions<TDocProcessType>>(
    (val) => {
      return val !== null && val !== undefined
    },
    { message: MSG_PLEASE_SELECT }
  ),
  dueDate: z.date().optional().nullable(),
  urgencyLevel: z.custom<TCommonSelectOptions<TUrgentLevel>>(
    (val) => {
      return val !== null && val !== undefined
    },
    { message: MSG_PLEASE_SELECT }
  ),
  subject: requireStringSchema,
  description: optionalStringSchema,
  signFlow: signFlowSchema,
  mainFile: z.file({ error: MSG_REQUIRED_FILE }),
  creatorSignFile: z.boolean({ error: MSG_PLEASE_SELECT }),
  annexesFiles: z.array(z.file()).optional(),
  relatedContent: optionalStringSchema,
  template: z.custom<TCommonSelectOptions<FlowSignTemplateVM>>(),
  destinations: z.array(z.custom<TFormSelectDestinationValue>(), { error: MSG_PLEASE_SELECT }),
  notation: requireStringSchema,
  relatedFiles: z.custom<FilesBySource>().optional()
})
