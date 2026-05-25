import { z } from 'zod'
import { MSG_REQUIRED_FIELD } from '../constants/message-text'

export const documentBookSelectSchema = z.object(
  {
    label: z.string(),
    value: z.object({
      id: z.string(),
      startCount: z.number(),
      availableCount: z.number(),
      documentTypesIds: z.array(z.string())
    })
  },
  { error: MSG_REQUIRED_FIELD }
)

export const adminDocTypeSelectSchema = z.object(
  {
    label: z.string(),
    value: z.string()
  },
  { error: MSG_REQUIRED_FIELD }
)
