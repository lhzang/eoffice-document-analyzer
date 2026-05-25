import type z from 'zod'
import type { optionalUnitSchema, staffsSchema, unitSchema } from '../schemas/commonSchema'

export type TOptionalUnitSchema = z.infer<typeof optionalUnitSchema>
export type TUnitSchema = z.infer<typeof unitSchema>
export type TStaffsSchema = z.infer<typeof staffsSchema>
