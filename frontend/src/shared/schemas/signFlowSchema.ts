import { OD_SIGN_TYPES } from '@/shared/constants/sign'
import { positiveNaturalNumberSchema } from '@/shared/schemas/commonSchema'
import z from 'zod'
import { MSG_PLEASE_SELECT } from '../constants/message-text'
import type { TSigner } from '../models/outDoc/signer'

export const signerSchema = z.custom<TSigner | null>((val) => val, {
  message: MSG_PLEASE_SELECT
})

export const optionalSignerSchema = z.custom<TSigner | null>().nullable()

export const signerWithOrderSchema = z.object({
  staff: signerSchema,
  index: positiveNaturalNumberSchema
})

export const signersWithOrderSchema = z.array(signerWithOrderSchema).optional().default([])

export const leaderUnitSigner = z
  .object({
    signType: z.literal(OD_SIGN_TYPES.leaderUnitSigner)
  })
  .extend({
    staffs: signersWithOrderSchema,
    isCollab: z.boolean().optional()
  })
export const staffUnitSigner = z
  .object({
    signType: z.literal(OD_SIGN_TYPES.staffUnitSigner)
  })
  .extend({
    staffs: signersWithOrderSchema,
    isCollab: z.boolean().optional()
  })
export const leaderCollaboratorSigner = z
  .object({
    signType: z.literal(OD_SIGN_TYPES.leaderCollaborator)
  })
  .extend({
    staffs: signersWithOrderSchema,
    isCollab: z.boolean().optional()
  })
export const staffCollaboratorSigner = z
  .object({
    signType: z.literal(OD_SIGN_TYPES.staffCollaborator)
  })
  .extend({
    staffs: signersWithOrderSchema,
    isCollab: z.boolean().optional()
  })
export const evaluatorSigner = z.object({
  signType: z.literal(OD_SIGN_TYPES.evaluator),
  staff: optionalSignerSchema
})
export const staffFormatSigner = z.object({
  signType: z.literal(OD_SIGN_TYPES.formatSigner),
  staff: optionalSignerSchema
})
export const leaderFormatSigner = z.object({
  signType: z.literal(OD_SIGN_TYPES.leaderFormatSigner),
  staff: optionalSignerSchema
})
export const majorSigner = z.object({
  signType: z.literal(OD_SIGN_TYPES.majorSigner),
  staff: signerSchema
})
export const minorSigner = z.object({
  signType: z.literal(OD_SIGN_TYPES.minorSigner),
  staff: signerSchema
})

export const signStepSchema = z.discriminatedUnion('signType', [
  leaderUnitSigner,
  staffUnitSigner,
  staffCollaboratorSigner,
  leaderCollaboratorSigner,
  evaluatorSigner,
  staffFormatSigner,
  leaderFormatSigner,
  majorSigner,
  minorSigner
])

export const signFlowSchema = z.array(signStepSchema).min(1, 'Vui lòng nhập trình tự ký')
