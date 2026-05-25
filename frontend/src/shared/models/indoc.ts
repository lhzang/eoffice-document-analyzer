import type { ReceiverVM } from '../services/api'

export type TProcessHistoryEventItem = {
  actionName: string
  timestamp: string
  receivers: Array<ReceiverVM>
  message: string
  files: Array<string>
}

export type TProcessHistoryGroupEvent = {
  positionId: string
  documentId: string
  displayName: string
  unitId: string
  eventItems: TProcessHistoryEventItem[]
}
