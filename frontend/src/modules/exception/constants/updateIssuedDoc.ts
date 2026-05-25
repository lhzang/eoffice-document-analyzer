export const EditTypesEnum = {
  UPDATE_ANNEXES: "UPDATE_ANNEXES",
  UPDATE_ISSUE_DATE: "UPDATE_ISSUE_DATE",
  CANCEL_ISSUE_DOCUMENT: "CANCEL_ISSUE_DOCUMENT",
  REPLACE_MAIN_FILE: "REPLACE_MAIN_FILE",
} as const;

export const DocumentTypeEnum = {
  OUT_DOCUMENT: "OUT_DOCUMENT",
  PAPER_OUT_DOCUMENT: "PAPER_OUT_DOCUMENT",
  INTERNAL_DOCUMENT: "INTERNAL_DOCUMENT",
} as const;

export const EDIT_TYPES = [
  {
    value: EditTypesEnum.REPLACE_MAIN_FILE,
    title: "Thay thế file văn bản chính",
  },
  {
    value: EditTypesEnum.UPDATE_ANNEXES,
    title: "Cập nhật danh sách file đính kèm",
  },
  {
    value: EditTypesEnum.UPDATE_ISSUE_DATE,
    title: "Cập nhật ngày ban hành văn bản",
  },
  {
    value: EditTypesEnum.CANCEL_ISSUE_DOCUMENT,
    title: "Hủy văn bản đã phát hành",
  }
];

export const DOCUMENT_SOURCES = [
  {
    value: DocumentTypeEnum.OUT_DOCUMENT,
    title: "Văn bản đi",
  },
  {
    value: DocumentTypeEnum.PAPER_OUT_DOCUMENT,
    title: "Văn bản đi (giấy)",
  },
  {
    value: DocumentTypeEnum.INTERNAL_DOCUMENT,
    title: "Văn bản nội bộ",
  },
];
