import { SIGNATURE_IMG_STATES } from '../constants/signatureImage'
import type { TSignatureImageState } from '../model/signatureimg'

export const getSeverityByState = (state: TSignatureImageState) => {
  if (state === SIGNATURE_IMG_STATES.accepted) return 'success'
  if (state === SIGNATURE_IMG_STATES.pending) return 'info'
  if (state === SIGNATURE_IMG_STATES.rejected) return 'danger'
}

export const getLabelByState = (state: TSignatureImageState) => {
  if (state === SIGNATURE_IMG_STATES.accepted) return 'Đã duyệt'
  if (state === SIGNATURE_IMG_STATES.pending) return 'Chờ duyệt'
  if (state === SIGNATURE_IMG_STATES.rejected) return 'Từ chối'
}
