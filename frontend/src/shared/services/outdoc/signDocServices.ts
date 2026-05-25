import type { TSignRemotePayload } from '@/shared/models/sign'
import { OutDocApi } from '../api'
import { apiClientConfig } from '../apiClientConfig'

const outDocApi = new OutDocApi(apiClientConfig)

export const signDocServices = {
  signRemote: async (payload: TSignRemotePayload) => {
    const res = await outDocApi.signDocument(payload?.docId, payload?.body)
    return res.data
  }
}
