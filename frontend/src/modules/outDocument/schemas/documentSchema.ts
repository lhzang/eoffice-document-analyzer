import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import { type TUrgentLevel } from '@/shared/constants/document'
import {
  MSG_PLEASE_SELECT,
  MSG_REQUIRED_FIELD,
  MSG_REQUIRED_FILE
} from '@/shared/constants/message-text'
import type { FilesBySource } from '@/shared/models/document'
import type { TIssueUnitSelectValue } from '@/shared/models/organization/unit'
import type { TFormSelectDestinationValue } from '@/shared/models/outDoc/destination'
import type { TDocProcessType } from '@/shared/models/outDoc/document'
import {
  optionalStringSchema,
  positiveNaturalNumberSchema,
  requireStringSchema,
  unitSchema
} from '@/shared/schemas/commonSchema'

import { signFlowSchema } from '@/shared/schemas/signFlowSchema'
import type {
  DocumentBookDetailVM,
  DocumentType,
  DocumentTypeVM,
  FlowSignTemplateVM,
  ListDocumentBooksVM
} from '@/shared/services/api'
import z from 'zod'
export const jointUnitSchema = z
  .array(
    z.object({
      unit: unitSchema,
      index: positiveNaturalNumberSchema
    })
  )
  .min(1, { error: MSG_PLEASE_SELECT })

export const baseCreateEDocShape = {
  documentType: z.custom<TCommonSelectOptions<string>>(
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
  issueUnit: z.custom<TIssueUnitSelectValue | null>((val) => val, {
    message: MSG_PLEASE_SELECT
  }),
  template: z.custom<TCommonSelectOptions<FlowSignTemplateVM>>(),
  destinations: z.array(z.custom<TFormSelectDestinationValue>()).optional(),
  relatedFiles: z.custom<FilesBySource>().optional()
}

export const createNormalEDocSchema = z
  .object({
    processTypeValue: z.literal('NORMAL')
  })
  .extend(baseCreateEDocShape)

export const createJointEDocSchema = z
  .object({
    processTypeValue: z.literal('JOINT'),
    jointUnits: jointUnitSchema
  })
  .extend(baseCreateEDocShape)

export const createReplaceEDocSchema = z
  .object({
    processTypeValue: z.literal('REPLACEMENT'),
    replaceDocId: z
      .string({ error: 'Vui lòng chọn văn bản thay thế' })
      .min(1, { error: 'Vui lòng chọn văn bản thay thế' })
  })
  .extend(baseCreateEDocShape)

export const createEDocSchema = z.discriminatedUnion('processTypeValue', [
  createJointEDocSchema,
  createReplaceEDocSchema,
  createNormalEDocSchema
])

export const createPaperOutDocSchema = z.object({
  documentType: z.custom<TCommonSelectOptions<string>>(
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
  annexesFiles: z.array(z.file()).optional(),
  relatedContent: optionalStringSchema,
  issueUnit: z.custom<TIssueUnitSelectValue | null>((val) => val, {
    message: MSG_PLEASE_SELECT
  }),
  template: z.custom<TCommonSelectOptions<FlowSignTemplateVM>>(),
  destinations: z.array(z.custom<TFormSelectDestinationValue>()).optional(),
  relatedFiles: z.custom<FilesBySource>().optional()
})

export const allocateEOutDocSchema = z.object({
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
  outOrdinal: requireStringSchema,
  documentCode: requireStringSchema,
  createdDate: z.date().optional().nullable(),
  issueDate: z.date({ error: MSG_PLEASE_SELECT }),
  subject: requireStringSchema,
  description: optionalStringSchema,
  majorSigner: optionalStringSchema,
  isSendImmediately: z.boolean(),
  destinations: z.array(z.custom<TFormSelectDestinationValue>()).optional()
})

export const allocatePaperOutDocSchema = z.object({
  documentBook: z.custom<TCommonSelectOptions<DocumentBookDetailVM>>(
    (val) => {
      return val !== null && val !== undefined
    },
    { message: MSG_REQUIRED_FIELD }
  ),
  documentType: z.custom<TCommonSelectOptions<DocumentType>>(
    (val) => {
      return val !== null && val !== undefined
    },
    { message: MSG_REQUIRED_FIELD }
  ),
  outOrdinal: requireStringSchema,
  documentCode: requireStringSchema,
  createdDate: z.date().optional().nullable(),
  issueDate: z.date({ error: MSG_PLEASE_SELECT }),
  subject: requireStringSchema,
  description: optionalStringSchema,
  majorSigner: optionalStringSchema,
  destinations: z.array(z.custom<TFormSelectDestinationValue>()).optional(),
  mainFile: z.file({ error: MSG_REQUIRED_FILE }),
  annexesFiles: z.array(z.file()).optional(),
  isSendImmediately: z.boolean()
})
