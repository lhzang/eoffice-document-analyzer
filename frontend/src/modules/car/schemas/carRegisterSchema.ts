import {
  MSG_FILE_WRONG_FORMAT,
  MSG_REQUIRED_FIELD,
  MSG_REQUIRED_FILE,
  MSG_WRONG_FORMAT
} from '@/shared/constants/message-text'
import {
  optionalStringSchema,
  phoneNumberSchema,
  requireStringSchema,
  unitSchema
} from '@/shared/schemas/commonSchema'
import z from 'zod'
import { CAR_TYPES } from '../constants/carType'

const registrationFileSchema = z
  .file({ error: MSG_REQUIRED_FILE })
  .mime(['application/pdf', 'image/png', 'image/jpeg'], { error: MSG_FILE_WRONG_FORMAT })

const staffCarSchema = z.object({
  carTypeValue: z.literal(CAR_TYPES.staff),
  staffName: requireStringSchema,
  licensePlate: requireStringSchema,
  eTag: requireStringSchema.regex(/^[0-9a-fA-F]+$/, { error: MSG_WRONG_FORMAT }),
  registrationFile: registrationFileSchema
})

export const guestCarSchema = z.object({
  carTypeValue: z.literal(CAR_TYPES.guest),
  ownerName: requireStringSchema,
  guestUnitName: optionalStringSchema,
  licensePlate: requireStringSchema.superRefine((value, ctx) => {
    if ((value || '').includes(',')) {
      return ctx.addIssue(
        'Vui lòng chỉ sử dụng dấu ";" để phân tách các biển số, không dùng dấu ","'
      )
    }
    const plates = (value || '')
      .split(';')
      .map((p) => p.trim().toUpperCase())
      .filter((p) => p !== '')

    // const invalid = plates.filter((p) => !plateRegex.test(p));
    // if (invalid.length > 0) {
    //   return 'Các biển không hợp lệ: ' + invalid.join(', ');
    // }

    const duplicates = plates.filter((plate, index) => plates.indexOf(plate) !== index)
    if (duplicates.length > 0) {
      const uniqueDuplicates = [...new Set(duplicates)]
      return ctx.addIssue('Các biển bị trùng: ' + uniqueDuplicates.join(', '))
    }
  }),
  visitUnit: unitSchema,
  workPeriod: z
    .tuple([z.date({ error: MSG_REQUIRED_FIELD }), z.date({ error: MSG_REQUIRED_FIELD })], {
      error: MSG_REQUIRED_FIELD
    })
    .refine(([start, end]) => start <= end, { message: 'Ngày bắt đầu phải bé hơn ngày kết thúc' })
    .refine(
      ([start, end]) => {
        const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        return diffDays >= 0 && diffDays <= 7
      },
      {
        message: 'Thời gian làm việc từ 1-7 ngày'
      }
    ),
  workContent: requireStringSchema,
  note: optionalStringSchema
})

const uploadCarSchema = z.object({
  uploadFile: z
    .file({ error: MSG_REQUIRED_FILE })
    .mime(
      [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ],
      { error: MSG_FILE_WRONG_FORMAT }
    ),
  type: z.literal('upload')
})

const manualCollaboratorCarSchema = z.object({
  carTypeValue: z.literal(CAR_TYPES.collaborator),
  type: z.literal('manual'),
  ownerName: requireStringSchema,
  licensePlate: requireStringSchema,
  phoneNumber: phoneNumberSchema,
  eTag: requireStringSchema.regex(/^[0-9a-fA-F]+$/, { error: MSG_WRONG_FORMAT }),
  workPeriod: z
    .tuple([z.date({ error: MSG_REQUIRED_FIELD }), z.date({ error: MSG_REQUIRED_FIELD })], {
      error: MSG_REQUIRED_FIELD
    })
    .refine(([start, end]) => start <= end, { message: 'Ngày bắt đầu phải bé hơn ngày kết thúc' })
    .refine(
      ([start, end]) => {
        const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        return diffDays >= 0 && diffDays <= 180
      },
      {
        message: 'Thời gian làm việc tối đa 6 tháng'
      }
    ),
  registrationFile: registrationFileSchema
})

const manualStudentCarSchema = z.object({
  carTypeValue: z.literal(CAR_TYPES.student),
  type: z.literal('manual'),
  studentName: optionalStringSchema,
  studentCode: optionalStringSchema,
  intakeCode: optionalStringSchema,
  className: optionalStringSchema,
  admissionYear: z.date().optional().nullable(),
  graduationDate: z.date({ error: MSG_REQUIRED_FIELD }),
  eTag: requireStringSchema.regex(/^[0-9a-fA-F]+$/, { error: MSG_WRONG_FORMAT }),
  email: z.email({ error: MSG_WRONG_FORMAT }).optional(),
  ownerName: requireStringSchema,
  licensePlate: requireStringSchema,
  registrationFile: registrationFileSchema
})

const manualUniCarSchema = z.object({
  carTypeValue: z.literal(CAR_TYPES.university),
  type: z.literal('manual'),
  licensePlate: requireStringSchema,
  eTag: requireStringSchema.regex(/^[0-9a-fA-F]+$/, { error: MSG_WRONG_FORMAT })
})

export const studenCarSchema = z.discriminatedUnion('type', [
  uploadCarSchema.extend({ carTypeValue: z.literal(CAR_TYPES.student) }),
  manualStudentCarSchema.extend({ carTypeValue: z.literal(CAR_TYPES.student) })
])
export const uniCarSchema = z.discriminatedUnion('type', [
  uploadCarSchema.extend({ carTypeValue: z.literal(CAR_TYPES.university) }),
  manualUniCarSchema.extend({ carTypeValue: z.literal(CAR_TYPES.university) })
])
export const collaboratorCarSchema = z.discriminatedUnion('type', [
  uploadCarSchema.extend({ carTypeValue: z.literal(CAR_TYPES.collaborator) }),
  manualCollaboratorCarSchema.extend({ carTypeValue: z.literal(CAR_TYPES.collaborator) })
])

export const carRegisSchema = z.discriminatedUnion('carTypeValue', [
  staffCarSchema,
  guestCarSchema,
  studenCarSchema,
  uniCarSchema,
  collaboratorCarSchema
])
