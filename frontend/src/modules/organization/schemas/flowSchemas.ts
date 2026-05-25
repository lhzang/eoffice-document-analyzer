import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import type { TDocumentProcessRole } from '@/shared/constants/document'
import { MSG_REQUIRED_FIELD } from '@/shared/constants/message-text'
import { staffsSchema, unitSchema, unitsSchema } from '@/shared/schemas/commonSchema'
import { z } from 'zod'
import type { TFlowConfigScope } from '../models/flow'
import { optionalStaffsSchema } from './../../../shared/schemas/commonSchema'

const baseFlowOrderConfigSchema = z.object({
  isParallel: z.boolean().default(false),
  isDistributeMultipleTime: z.boolean().default(false),
  paperCreators: optionalStaffsSchema,
  internetReceivers: optionalStaffsSchema
})

const proposeFlowOrderConfigSchema = baseFlowOrderConfigSchema.extend({
  enablePropose: z.literal(true),
  proposeRequesters: staffsSchema,
  proposeApprovers: staffsSchema
})

const distributeFlowOrderConfigSchema = baseFlowOrderConfigSchema.extend({
  enablePropose: z.literal(false),
  distributors: staffsSchema
})

export const flowOrderConfigSchema = z.discriminatedUnion('enablePropose', [
  proposeFlowOrderConfigSchema,
  distributeFlowOrderConfigSchema
])

export const flowUnitRelatedConfigSchema = z.object({
  unit: unitSchema,
  scope: z.custom<TCommonSelectOptions<TFlowConfigScope>>((val) => val, {
    message: MSG_REQUIRED_FIELD
  })
})

export const flowDistributeConfigSchema = z.strictObject({
  receivers: unitsSchema,
  enabledDistributionRoles: z
    .array(z.custom<TDocumentProcessRole>())
    .min(1, { message: MSG_REQUIRED_FIELD }),
  receivedUnits: z.array(flowUnitRelatedConfigSchema).min(1, { message: MSG_REQUIRED_FIELD })
})

export const flowAssignConfigSchema = z.object({
  assignees: unitsSchema,
  enabledAssignmentRoles: z
    .array(z.custom<TDocumentProcessRole>())
    .min(1, { message: MSG_REQUIRED_FIELD }),
  assignedUnits: z.array(flowUnitRelatedConfigSchema).min(1, { message: MSG_REQUIRED_FIELD })
})

export const flowConfigSchema = z.discriminatedUnion('enablePropose', [
  proposeFlowOrderConfigSchema.merge(flowDistributeConfigSchema).merge(flowAssignConfigSchema),
  distributeFlowOrderConfigSchema.merge(flowDistributeConfigSchema).merge(flowAssignConfigSchema)
])
