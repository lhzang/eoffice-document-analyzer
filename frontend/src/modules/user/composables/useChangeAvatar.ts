import { notifyError } from '@/shared/utils/common'
import { useMutation, type MutationOptions } from '@tanstack/vue-query'
import { accountService } from '../services/accountService'

type AccountAvatar = {
  accountId: string;
  profilePic: File;
}

export const useChangeAvatar = (
  options?: MutationOptions<void, TServerError, AccountAvatar>
) =>
  useMutation({
    mutationFn: ({ accountId, profilePic }) => accountService.changeAvatar(accountId, profilePic),
    onError: (e) => {
      notifyError(e, 'Đổi ảnh thất bại')
    },
    ...options
  })