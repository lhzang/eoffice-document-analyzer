import { DateTime } from 'luxon'
import type { TODAction } from '../../../modules/outDocument/constants/actions'

export const formatDateForOutDocTable = (date: string) => {
  const currentYear = new Date().getFullYear()
  const year = new Date(date).getFullYear()
  const dateValue = DateTime.fromISO(date)
  if (year === currentYear) return dateValue.toFormat('dd/MM')
  return dateValue.toFormat('dd/MM/yyyy')
}

export const hasODAction = (availableActions: string[], action: TODAction) => {
  return availableActions?.includes(action)
}
