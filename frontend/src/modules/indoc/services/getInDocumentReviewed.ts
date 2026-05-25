import { dataIDWaitForReview } from '../mocks/dataIDWaitForReview'

import type {
  IDataInDocument,
  IInDocumentDetail,
  TCommonIndocFilter,
  TPriorityLevelValue
} from '../models/types'

export function getInDocumentPROCESSED(payload: TCommonIndocFilter): Promise<IDataInDocument> {
  let newData: IInDocumentDetail[] = []
  const page = payload.pageSize ?? 1
  const pageSize = payload.pageSize ?? 10
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  delete payload.pageSize
  delete payload.pageSize

  if (Object.keys(payload)?.length === 0) newData = dataIDWaitForReview
  else
    newData = dataIDWaitForReview.filter((doc: IInDocumentDetail) =>
      Object.entries(payload).every(([key, value]) => {
        if (!value || value === '') return true
        if (key === 'search' && value)
          return doc.shortDescription.toLowerCase().includes(value.toLowerCase())
        if (key === 'documentTypes') return value?.some((val: string) => val === doc.documentTypeId)
        if (key === 'priorityLevels')
          return value?.some((val: TPriorityLevelValue) => val === doc.priorityLevel)
        // if (key === 'bookType') return value.some((type: TDocumentType) => type === doc[key])
        // return doc[key as keyof IInDocumentDetail] === value
      })
    )

  const pageCount = Math.ceil(newData.length / pageSize)

  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          docCount: newData.length,
          page,
          pageCount,
          pageSize,
          // docs: newData
          docs: newData.slice(startIndex, endIndex)
        }),
      100
    )
  )
}
