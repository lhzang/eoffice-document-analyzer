import { Configuration } from '@/shared/services/api'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'

export const createApiConfig = () => {
  const profileStore = useUserProfileStore()

  return new Configuration({
    accessToken: () => profileStore.accessToken!
  })
}
