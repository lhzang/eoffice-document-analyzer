import { TaskApi, type UpdateTaskInfoRequest, type StaffDTO } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import { TASK_ROLE } from '../constants/task'
import type { PersonOption } from '../models/type'

const taskControllerApi = new TaskApi(apiClientConfig)

export const updateTaskInfo = async (taskId: string, request: UpdateTaskInfoRequest) => {
  const result = await taskControllerApi.updateTaskInfo(taskId, request)
  return result.data
}

export const processAndUpdateTaskInfo = async (
  taskId: string,
  formValues: { name: string; content?: string; leader: PersonOption | null; viewer?: PersonOption | null }
) => {
  const staff: StaffDTO[] = []

  if (formValues.leader?.id) {
    staff.push({ id: formValues.leader.id, role: TASK_ROLE.leader })
  }

  if (formValues.viewer?.id) {
    staff.push({ id: formValues.viewer.id, role: TASK_ROLE.viewer })
  }

  const request = {
    name: formValues.name,
    content: formValues.content || '',
    staff: staff,
  }

  return updateTaskInfo(taskId, request)
}

export default {
  updateTaskInfo,
  processAndUpdateTaskInfo,
}
























