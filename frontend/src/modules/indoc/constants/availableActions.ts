export const INDOC_ACTION = {
  // Assignee Actions
  comment: 'COMMENT',
  rejectAssignee: 'REJECT_ASSIGNEE',
  finishAssignee: 'FINISH_ASSIGNEE',
  revokePermission: 'REVOKE_PERMISSION',
  report: 'REPORT',
  assign: 'ASSIGN',
  delegate: 'DELEGATE',
  udpateDocument: 'UPDATE_DOCUMENT',
  ignoreDocument: 'IGNORE_DOCUMENT',
  // Document Actions
  propose: 'PROPOSE',
  register: 'REGISTER',
  revokeDocument: 'REVOKE_DOCUMENT',
  distribute: 'DISTRIBUTE',
  updatePropose: 'UPDATE_PROPOSE',
  evaluateDistribute: 'EVALUATE_DISTRIBUTE',
  rejectDocument: 'REJECT_DOCUMENT',
  finishDocument: 'FINISH_DOCUMENT',
  rejectUpdate: 'REJECT_UPDATE'
} as const

export type IndocActionType = (typeof INDOC_ACTION)[keyof typeof INDOC_ACTION]

export const CREATE_HISTORY_INDOC_ACTION_VALUES = {
  createPaper: 'PAPERDOCUMENTCREATED',
  registerIncomingDoc: 'INCOMINGDOCUMENTREGISTERED',
  proposeDoc: 'DOCUMENTPROPOSED',
  rejectIncomingDoc: 'INCOMINGDOCUMENTREJECTED',
  revokePaper: 'PAPERDOCUMENTWASREVOKED',
  revokeInternet: 'INTERNETDOCUMENTWASREVOKED',
  distributeDoc: 'DOCUMENTDISTRIBUTED'
} as const

export const CREATE_HISTORY_INDOC_LABEL = {
  [CREATE_HISTORY_INDOC_ACTION_VALUES.createPaper]: 'tạo',
  [CREATE_HISTORY_INDOC_ACTION_VALUES.registerIncomingDoc]: 'nhập sổ',
  [CREATE_HISTORY_INDOC_ACTION_VALUES.proposeDoc]: 'gửi đề xuất phân phối',
  [CREATE_HISTORY_INDOC_ACTION_VALUES.rejectIncomingDoc]: 'trả lại',
  [CREATE_HISTORY_INDOC_ACTION_VALUES.revokePaper]: 'thu hồi',
  [CREATE_HISTORY_INDOC_ACTION_VALUES.revokeInternet]: 'thu hồi',
  [CREATE_HISTORY_INDOC_ACTION_VALUES.distributeDoc]: 'phân phối'
}
