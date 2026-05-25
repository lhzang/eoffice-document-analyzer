import type { FilesBySource, TDeviceFiles, TDocFiles } from '@/shared/models/document'
import type { TStaffSelectValue } from '@/shared/models/organization/unit'
import {
  FileDTOTypeEnum,
  TaskApi,
  type CreateSubtaskRequest,
  type CreateTaskRequest,
  type StaffDTO,
  type StaffDTORoleEnum
} from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import { DateTime } from 'luxon'
import { SUBTASK_ROLE, TASK_ROLE } from '../constants/task'
import type { CreateTaskFormValues } from '../models/type'

const taskControllerApi = new TaskApi(apiClientConfig)

export const createTask = async (request: CreateTaskRequest, files?: File[]) => {
  const result = await taskControllerApi.createNewTask(request, files)
  return result.data
}

// Map TStaffSelectValue[] to StaffDTO[]
const mapStaffToStaffDTO = (
  arr: TStaffSelectValue[] | undefined,
  role: StaffDTORoleEnum
): StaffDTO[] => {
  if (!arr || arr.length === 0) return []

  return arr
    .filter((item) => !!item.positionId)
    .map((staff) => ({
      id: staff.positionId,
      role
    }))
}

export const processAndCreateTask = async (
  formValues: CreateTaskFormValues,
  filesBySource: FilesBySource
) => {
  const staff: StaffDTO[] = [
    ...mapStaffToStaffDTO(formValues.leaders, TASK_ROLE.leader),
    ...mapStaffToStaffDTO(formValues.viewers, TASK_ROLE.viewer)
  ]

  const subtaskRequestList: CreateSubtaskRequest[] = (formValues.task || []).map((item) => {
    const subtaskStaff: StaffDTO[] = [
      ...mapStaffToStaffDTO(item.executors, SUBTASK_ROLE.executor),
      ...mapStaffToStaffDTO(item.collaborators, SUBTASK_ROLE.collaborator)
    ]
    const request: CreateSubtaskRequest = {
      name: item.subtaskName,
      content: item.note,
      staff: subtaskStaff,
      deadline: DateTime.fromJSDate(item.subExpectedDueDate).toISO({ includeOffset: false }) || ''
    }
    return request
  })

  const existingFiles = [
    ...(filesBySource?.fromDoc ?? [])?.map((relatedDoc) => ({
      relatedId: relatedDoc?.id,
      type: 'IN_DOCUMENT_FILE' as FileDTOTypeEnum
    }))
  ]

  const uploadFilesList = (filesBySource?.upload ?? [])?.map((file) => file?.file)

  const payload: CreateTaskRequest = {
    name: formValues.taskName,
    content: formValues.shortDescription,
    staff: staff,
    subtaskRequestList: subtaskRequestList,
    existingFiles: existingFiles
  }

  return createTask(payload, uploadFilesList)
}

export default {
  createTask,
  processAndCreateTask
}
