import {
  SubtaskApi,
  type UpdateSubtaskRequest,
  type StaffDTO,
  StaffDTORoleEnum,
} from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import type { TPersonWithRole } from '../models/type'

const subtaskControllerApi = new SubtaskApi(apiClientConfig)

export const updateSubtask = async (subtaskId: string, request: UpdateSubtaskRequest) => {
  const result = await subtaskControllerApi.updateSubtask(subtaskId, request)
  return result.data
}

export const processAndUpdateSubtask = async (
  subtaskId: string,
  formData: {
    editSubtaskName: string
    editSubtaskContent: string
    editExecutor?: TPersonWithRole | null
    editCollaborator?: TPersonWithRole | null
  },
) => {
  const staff: StaffDTO[] = []

  if (formData.editExecutor?.id && formData.editExecutor?.role) {
    staff.push({
      id: formData.editExecutor.id,
      role: formData.editExecutor.role as StaffDTORoleEnum,
    })
  }

  if (formData.editCollaborator?.id && formData.editCollaborator?.role) {
    staff.push({
      id: formData.editCollaborator.id,
      role: formData.editCollaborator.role as StaffDTORoleEnum,
    })
  }

  const request = {
    name: formData.editSubtaskName,
    content: formData.editSubtaskContent,
    staff: staff, 
  }

  return updateSubtask(subtaskId, request)
}

export default {
  updateSubtask,
  processAndUpdateSubtask,
}




















