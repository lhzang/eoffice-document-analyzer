import { appConfig } from '@/config/app-config'
import { useUserProfileStore } from '../stores/userProfileStore'
import { Configuration } from './api'

export const apiClientConfig = new Configuration({
  basePath: appConfig.VITE_API_SERVER,
  accessToken: () => `${useUserProfileStore().accessToken}`
})
