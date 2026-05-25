import {
  SECRETARY_APPROVE_CONFIG_LABELS,
  SECRETARY_VIEW_INDOC_CONFIG_LABELS
} from '../constants/secretaryConfig'

export const handleGenApproveOpts = () => {
  return {
    options: Object.entries(SECRETARY_APPROVE_CONFIG_LABELS)?.map(([value, label]) => ({
      label,
      value
    })),
    hasMore: false
  }
}

export const handleGenViewOpts = () => {
  return {
    options: Object.entries(SECRETARY_VIEW_INDOC_CONFIG_LABELS)?.map(([value, label]) => ({
      label,
      value
    })),
    hasMore: false
  }
}
