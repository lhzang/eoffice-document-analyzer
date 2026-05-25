export const DOCUMENT_BOOK_TYPES_VALUES = {
  inDoc: 'INCOMING_DOCUMENT',
  outDoc: 'OUTGOING_DOCUMENT',
  internalDoc: 'INTERNAL_DOCUMENT'
} as const

export const listDocumentBookTypeOptions = [
  {
    label: 'Văn bản đến',
    value: DOCUMENT_BOOK_TYPES_VALUES.inDoc
  },
  {
    label: 'Văn bản đi',
    value: DOCUMENT_BOOK_TYPES_VALUES.outDoc
  },
  {
    label: 'Văn bản nội bộ',
    value: DOCUMENT_BOOK_TYPES_VALUES.internalDoc
  }
]
