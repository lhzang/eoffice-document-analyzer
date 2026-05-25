import type { TAddDocumentInBookIDFromInternetPayLoad } from '../models/types'

export function addDocumentInBookIDFromInternet(
  payload: TAddDocumentInBookIDFromInternetPayLoad
): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), 100))
}
