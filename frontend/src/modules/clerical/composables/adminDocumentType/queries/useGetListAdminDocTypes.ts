import type { TGetListAdminDocParams } from '@/shared/models/clerical/adminDocument'
import type { QueryOptions, TResponseListData } from '@/shared/models/common'
import type { DocumentType } from '@/shared/services/api'
import sharedAdminDocumentTypeService from '@/shared/services/clerical/adminDocumentTypeServices'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetListAdminDocTypes = (
  payload: MaybeRefOrGetter<TGetListAdminDocParams>,
  options?: QueryOptions<TResponseListData<DocumentType>, TServerError>
) => {
  return useQuery<TResponseListData<DocumentType>, TServerError>({
    queryKey: ['getListAdminDocTypes', payload],
    queryFn: () => sharedAdminDocumentTypeService.getListTypes(toValue(payload)),
    ...options
  })
}
