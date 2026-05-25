import type { TStaffSelectValue } from '@/shared/models/organization/unit'

export type TTaskStatus = 'COMPLETED' | 'PROCESSING'

export type TPersonWithRole = {
  id: string
  name: string
  title?: string
  titleAbbr?: string
  role?: string
}

export type CreateSubtaskFormData = {
  subTaskName: string
  executor: TStaffSelectValue[]
  collaborator?: TStaffSelectValue[] | undefined
  expectedDueDate: Date
  subTaskDescription: string
}

export type PersonOption = { id: string; name: string; title?: string; titleAbbr?: string }
type SubtaskFormItem = {
  subtaskName: string
  subExpectedDueDate: Date
  note: string
  executors: TStaffSelectValue[]
  collaborators?: TStaffSelectValue[]
}
export type CreateTaskFormValues = {
  shortDescription: string
  taskName: string
  leaders: TStaffSelectValue[]
  viewers?: TStaffSelectValue[]
  task: SubtaskFormItem[]
}

export type TaskFilterRequest = {
  name?: string
  staffRole?: string
  accepted?: boolean
}