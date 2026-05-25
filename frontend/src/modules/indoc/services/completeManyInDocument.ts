import type { TPayLoadCompleteManyInDocument } from '../models/types'

export function completeManyInDocument(payload: TPayLoadCompleteManyInDocument): Promise<unknown> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true, message: 'Thành công rồi!', data: null }), 100)
  )
}
