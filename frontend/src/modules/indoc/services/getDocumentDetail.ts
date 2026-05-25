import { dataIDWaitForReview } from '../mocks/dataIDWaitForReview'

import type { IInDocumentDetail } from '../models/types'

export function getDocumentDetail(documentId: string): Promise<IInDocumentDetail> {
  return new Promise((resolve) =>
    setTimeout(() => {
      const documentDetail = dataIDWaitForReview.find(
        (doc: IInDocumentDetail) => doc._id === documentId
      )
      resolve(documentDetail as IInDocumentDetail)
    }, 2000)
  )
}
