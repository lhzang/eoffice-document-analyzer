export const OUTDOC_ACTION = {
  sign: 'SIGN',
  signWithMessage: 'SIGN_WITH_MESSAGE',
  evaluated: 'EVALUATED',
  secretaryEvaluated: 'SECRETARY_EVALUATED',
  issued: 'ISSUED',
  addDestination: 'ADD_DESTINATION',
  revoke: 'REVOKE',
  sendDestination: 'SEND_DESTINATION',
  updateDocument: 'UPDATE_DOCUMENT',
  creatorRevoke: 'CREATOR_REVOKE',
  updateRelatedFiles: 'UPDATE_RELATED_FILES',
  reject: 'REJECT',
  stamp: 'STAMP',
  delete: 'DELETE',
  reissued: 'REISSUED',
  recreate: 'RECREATE',
  printDocument: 'PRINT_DOCUMENT'
} as const
export type TODAction = (typeof OUTDOC_ACTION)[keyof typeof OUTDOC_ACTION]
