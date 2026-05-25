import { optionalStringSchema } from '@/shared/schemas/commonSchema'
import { z } from 'zod'

export const documentSearchSchema = z.object({
  search: optionalStringSchema,
  documentSource: z.literal(['INCOMING', 'OUTGOING', 'ALL', 'INTERNAL']),
  year: z.number().optional()
})
