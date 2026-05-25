import { InDocApi, type RevokePermissionCommand, type ReceiverVM, type ReceiverDTO } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'

const inDocApi = new InDocApi(apiClientConfig)

export async function revokePermission(
  id: string,
  payload: { receivers: ReceiverVM[]; message: string; revokerId: string }
): Promise<void> {
  const receiversDto: ReceiverDTO[] = payload.receivers.map((r) => ({
    id: r.id,
    role: r.role,
    type: r.type
  }))

  const body: RevokePermissionCommand = {
    docId: id,
    revokerId: payload.revokerId,
    receivers: receiversDto,
    message: payload.message
  }

  const result = await inDocApi.revokeDistributedDocument(id, body)
  return result.data
}


