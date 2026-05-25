import type { TUpdateDueDatePayload } from '../models/types'

export function updateDueDateInDocument(payload: TUpdateDueDatePayload): Promise<unknown> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true, message: 'Thành công rồi!', data: null }), 100)
  )
}
