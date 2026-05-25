import type { TGetListAdminDocParams } from '@/shared/models/clerical/adminDocument'
import type { TResponseListData } from '@/shared/models/common'
import { mappingServerPaginatedData } from '../../utils/common'
import { DocumentTypeApi, type DocumentType } from '../api/api'
import { apiClientConfig } from '../apiClientConfig'

const adminDocTypeControllerApi = new DocumentTypeApi(apiClientConfig)

const sharedAdminDocumentTypeService: {
  getListTypes: (
    payload: Partial<TGetListAdminDocParams> & { name?: string }
  ) => Promise<TResponseListData<DocumentType>>
} = {
  getListTypes: async (payload: Partial<TGetListAdminDocParams> & { name?: string }) => {
    const { search, name, ...pageable } = payload
    const result = await adminDocTypeControllerApi.getListTypes(
      pageable.page,
      pageable.size,
      pageable.sort,
      name
    )
    return mappingServerPaginatedData(result.data)
  }
}

export default sharedAdminDocumentTypeService
