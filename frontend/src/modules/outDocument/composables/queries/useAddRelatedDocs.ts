import type { MutationOptions } from '@/shared/models/common'
import type { AddRelatedFilesToOutDocumentRequest } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import { outDocServices } from '../../services/document'

type TPayload = {
  docId: string
  relatedDocs: AddRelatedFilesToOutDocumentRequest
}

export const useAddRelatedDocs = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: (payload) => outDocServices.addRelatedFiles(payload?.docId, payload?.relatedDocs),
    onError: (e) => notifyError(e, 'Đã có lỗi khi bổ sung file căn cứ'),
    ...options
  })
