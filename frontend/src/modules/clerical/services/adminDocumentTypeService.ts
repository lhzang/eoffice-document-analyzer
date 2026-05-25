import {
  DocumentTypeApi,
  type CreateDocumentTypeCommand,
  type UpdateDocumentTypeCommand
} from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'

const adminDocTypeControllerApi = new DocumentTypeApi(apiClientConfig)

const adminDocTypeService = {
  addNewType: async (payload: CreateDocumentTypeCommand) => {
    const result = await adminDocTypeControllerApi.createType(payload)
    return result.data
  },
  updateType: async (id: string, payload: UpdateDocumentTypeCommand) => {
    const result = await adminDocTypeControllerApi.updateType(id, payload)
    return result.data
  },
  deleteType: async (id: string) => {
    const result = await adminDocTypeControllerApi.deleteType(id)
    return result.data
  }
}

export default adminDocTypeService
