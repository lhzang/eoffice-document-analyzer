import {
  SubtaskApi,
  type CreateSubtaskRequest,
  type SubtaskReportRequest,
  type UpdateSubtaskRequest
} from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import { cleanObject } from '@/shared/utils/common'

const subtaskControllerApi = new SubtaskApi(apiClientConfig)

const subtaskService = {
  acceptSubtask: async (subtaskId: string) => {
    const result = await subtaskControllerApi.acceptSubtask(subtaskId)
    return result.data
  },

  completeSubtask: async (subtaskId: string) => {
    const result = await subtaskControllerApi.completeSubtask(subtaskId)
    return result.data
  },

  createSubtask: async (taskId: string, payload: CreateSubtaskRequest) => {
    const result = await subtaskControllerApi.createSubtask(taskId, payload)
    return result.data
  },

  deleteSubtask: async (subtaskId: string) => {
    const result = await subtaskControllerApi.deleteSubtask(subtaskId)
    return result.data
  },

  rejectSubtask: async (subtaskId: string, reason?: string) => {
    const result = await subtaskControllerApi.rejectSubtask(
      subtaskId,
      cleanObject({ reason: reason })
    )
    return result.data
  },

  reportSubtask: async (subtaskId: string, request: SubtaskReportRequest, files?: File[]) => {
    const result = await subtaskControllerApi.reportSubtask(subtaskId, request, files)
    return result.data
  },

  updateSubtask: async (subtaskId: string, request: UpdateSubtaskRequest) => {
    const result = await subtaskControllerApi.updateSubtask(subtaskId, request)
    return result.data
  }
}

export default subtaskService
