import { z } from 'zod'
import { MSG_PLEASE_SELECT, MSG_REQUIRED_FIELD, MSG_WRONG_FORMAT } from '../constants/message-text'
import type { TStaffSelectValue, TUnitSelectValue } from '../models/organization/unit'

export const commonSelectSchema = z.object(
  {
    label: z.string(),
    value: z.string()
  },
  { error: MSG_REQUIRED_FIELD }
)

export const staffsSchema = z.custom<TStaffSelectValue[] | null>(
  (val) => Array.isArray(val) && val.length > 0,
  {
    message: MSG_PLEASE_SELECT
  }
)
// .default([])
export const staffSchema = z.custom<TStaffSelectValue | null>((val) => val, {
  message: MSG_PLEASE_SELECT
})
export const optionalStaffSchema = z.custom<TStaffSelectValue | null>().nullable()
export const optionalStaffsSchema = z.custom<TStaffSelectValue[] | null>().nullable()
export const unitsSchema = z.custom<TUnitSelectValue[] | null>((val) => val, {
  message: MSG_PLEASE_SELECT
})
export const unitSchema = z.custom<TUnitSelectValue | null>((val) => val, {
  message: MSG_PLEASE_SELECT
})
export const optionalUnitSchema = z.custom<TUnitSelectValue | null>().nullable()
export const requireStringSchema = z
  .string({ message: MSG_REQUIRED_FIELD })
  .trim()
  .min(1, { message: MSG_REQUIRED_FIELD })
export const optionalStringSchema = z.string().optional()
export const phoneNumberSchema = z
  .string({ message: MSG_REQUIRED_FIELD })
  .refine((val) => !val?.trim() || /(84|\+84|0[0-9])+([0-9]{8,9})\b/.test(val), {
    message: MSG_WRONG_FORMAT
  })

export const positiveNaturalNumberSchema = z
  .number({ error: MSG_REQUIRED_FIELD })
  .min(1, { error: 'Vui lòng nhập số lớn hơn 0' })
