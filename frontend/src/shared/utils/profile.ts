import userService from '@/modules/user/services/userService'
import type { TAppFeatureKey } from '../constants/permission'
import { useUserProfileStore } from '../stores/userProfileStore'
import { useToastEvtBus } from './common'

export async function updateProfile() {
  const toast = useToastEvtBus()
  try {
    const profileStore = useUserProfileStore()
    const data = await userService.getUser()

    if (data) {
      profileStore.updateUser({
        ...data,
        currentPermission: data.currentPermission as TAppFeatureKey[]
      })
    } else profileStore.updateUser(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Thất bại',
      detail:
        error?.response?.data?.detail ??
        error?.message ??
        'Có lỗi xảy ra khi lấy thông tin người dùng',
      life: 3000
    })
  }
}
