import { InDocApi } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import type { ReceiverVM } from '@/shared/services/api'

const inDocApi = new InDocApi(apiClientConfig)

export async function getRevocableAssignees(documentId: string): Promise<ReceiverVM[]> {
  const response = await inDocApi.getRevocableAssignees(documentId)
  return response.data
}



