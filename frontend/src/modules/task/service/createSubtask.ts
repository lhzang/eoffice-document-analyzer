import {
  SubtaskApi,
  type CreateSubtaskRequest,
  type StaffDTO,
} from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import type { CreateSubtaskFormData } from '../models/type'
import { SUBTASK_ROLE } from '../constants/task'

const subtaskControllerApi = new SubtaskApi(apiClientConfig)

export const createSubtask = async (taskId: string, request: CreateSubtaskRequest) => {
  const result = await subtaskControllerApi.createSubtask(taskId, request)
  return result.data
}

export const processAndCreateSubtask = async (taskId: string, formData: CreateSubtaskFormData) => {
  const staff: StaffDTO[] = []

  if (Array.isArray(formData.executor)) {
    staff.push(
      ...formData.executor
        .filter(item => item.positionId)
        .map(item => ({
          id: item.positionId,
          role: SUBTASK_ROLE.executor,
        }))
    )
  }

  if (Array.isArray(formData.collaborator)) {
    staff.push(
      ...formData.collaborator
        .filter(item => item.positionId)
        .map(item => ({
          id: item.positionId,
          role: SUBTASK_ROLE.collaborator,
        }))
    )
  }

  const request: CreateSubtaskRequest = {
    ...formData,
    staff: staff,
  }

  return createSubtask(taskId, request)
}

export default {
  createSubtask,
  processAndCreateSubtask,
}