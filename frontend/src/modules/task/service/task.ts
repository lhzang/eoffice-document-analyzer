import {
  TaskApi,
  type UpdateTaskFileRequest,
} from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import type { TaskFilterRequest } from '../models/type'

const taskControllerApi = new TaskApi(apiClientConfig)

const taskService = {
  getTaskById: async (taskId: string) => {
    const result = await taskControllerApi.getTaskById(taskId)
    return result.data
  },

  getTasks: async (args: {
    filterRequest: TaskFilterRequest
    page?: number
    size?: number
    sort?: string[]
  }) => {
    const { filterRequest, page, size, sort } = args
    const { name, staffRole, accepted } = filterRequest
    const result = await taskControllerApi.getTasks(name, staffRole, accepted, page, size, sort)
    return result.data
  },

  updateTaskFiles: async (
    taskId: string,
    request: UpdateTaskFileRequest,
    files: File[],
  ) => {
    const result = await taskControllerApi.updateTaskFiles(taskId, request, files)
    return result.data
  },

  deleteTask: async (taskId: string) => {
    const result = await taskControllerApi.deleteTask(taskId)
    return result.data
  },
}

export default taskService