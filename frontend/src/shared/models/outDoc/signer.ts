import type { TRoleInUnit } from '@/shared/constants/common'
import type { signFlowSchema } from '@/shared/schemas/signFlowSchema'
import type { FlowSignTemplateVM, FlowStepTemplateVM } from '@/shared/services/api'
import type z from 'zod'

export type TSigner = {
  positionId: string
  displayName: string
  unitId: string
  roleInUnit: TRoleInUnit
}

export type TSignerWithSignOrder = {
  staff: TSigner
  index: number
}

export type TSignStaff = {
  id: string
  name: string
  unitId: string
  roleInUnit: TRoleInUnit
}

export type TDocumentSignFlow = z.infer<typeof signFlowSchema>
export type TDocumentSignSteps = {
  id?: string
  name?: string
  steps: Array<FlowStepTemplateVM & { isCollab?: boolean }>
}
