import { esignService } from '@/modules/esign/services/esignImageService'
import type { QueryOptions } from '@/shared/models/common'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { TSignatureImages } from '../../model/signatureimg'

export const useSignatureImages = (
  accountId: MaybeRefOrGetter<string>,
  options?: QueryOptions<TSignatureImages, TServerError>
) =>
  useQuery<TSignatureImages, TServerError>({
    queryKey: ['get-signature-images', accountId],
    queryFn: () => esignService.getSignatureImage(toValue(accountId)),
    ...options
  })
