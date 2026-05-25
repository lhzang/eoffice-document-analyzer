import { notifyError } from '@/shared/utils/common'
import { useMutation, type MutationOptions } from '@tanstack/vue-query'

import inDocService from '../../inDocService'

export type TSignInDocPayload = {
  docId: string
  body: {
    totp: string
  }
}

export const useSignInDoc = (options?: MutationOptions<void, TServerError, TSignInDocPayload>) =>
  useMutation({
    mutationFn: (payload: TSignInDocPayload) => inDocService.signInDoc(payload),
    onError: (e) => notifyError(e, 'Ký số thất bại'),
    ...options
  })
