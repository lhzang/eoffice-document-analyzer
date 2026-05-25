import type { TProcessHistoryGroupEvent } from '@/modules/indoc/models/types'
import {
  APP_DOCUMENT_TYPES,
  DOCUMENT_PROCESS_ROLES,
  DOCX_EXTENSION,
  FALLBACK_DOC_FILE_NAME,
  PDF_EXTENSION,
  PDF_FILE_TYPE,
  URGENCY_LEVELS,
  type TDocumentProcessRole,
  type TDocumentType
} from '../constants/document'
import type { TDistributeRole } from '../models/common'
import type { TDocumentProcessValue, TUrgencyLevelValue } from '../models/document'
import type { ProcessingEventVM, RelatedFileRequestTypeEnum } from '../services/api'
import { useUserProfileStore } from '../stores/userProfileStore'
import { UrgentLevelsEnum } from './../constants/document'

export const downLoadDocumentFileViaUrl = async (url: string, fileNameWithExtension?: string) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${useUserProfileStore().accessToken}`
    }
  })
  const blob = await response.blob()
  const a = document.createElement('a')
  const fileType = blob.type
  const extension = fileType === PDF_FILE_TYPE ? PDF_EXTENSION : DOCX_EXTENSION
  const objectUrl = URL.createObjectURL(blob)
  a.href = objectUrl
  a.download = fileNameWithExtension ?? FALLBACK_DOC_FILE_NAME + extension
  a.click()
  URL.revokeObjectURL(objectUrl)
}

export const isPdfOrDocxFilename = (fileName: string) => {
  return fileName?.endsWith(PDF_EXTENSION) || fileName?.endsWith(DOCX_EXTENSION)
}

export const getNameFromFilePath = (filePath: string) => {
  return filePath?.split('/')?.pop() ?? ''
}

export const addPdfExtension = (fileName: string) => {
  if (!fileName.endsWith(PDF_EXTENSION)) {
    return `${fileName}${PDF_EXTENSION}`
  }
  return fileName
}

export const getUrgencyLevelOptions = (omitValues?: TUrgencyLevelValue[]) => {
  const shownUrgencies = omitValues?.length
    ? URGENCY_LEVELS?.filter((level) => level.value)
    : URGENCY_LEVELS
  return shownUrgencies?.map((urgency) => ({
    label: urgency.title,
    value: urgency.value
  }))
}

export const getUrgencyLevelSelectData = async () => {
  return {
    options: getUrgencyLevelOptions(),
    hasMore: false
  }
}

export const getUrgentLevel = (
  levelValue: (typeof UrgentLevelsEnum)[keyof typeof UrgentLevelsEnum]
) => {
  return URGENCY_LEVELS?.find((level) => level?.value === levelValue)
}

export function getGroupDistributedItemsByRole(distributedItems: TDocumentProcessValue[]) {
  const groupedItem: Record<TDistributeRole, string[]> = {
    [DOCUMENT_PROCESS_ROLES.Director]: [],
    [DOCUMENT_PROCESS_ROLES.Leader]: [],
    [DOCUMENT_PROCESS_ROLES.Collaborator]: [],
    [DOCUMENT_PROCESS_ROLES.Viewer]: []
  }
  distributedItems?.forEach((item) => groupedItem?.[item.action]?.push(item.subjectName))
  return groupedItem
}

export const getPriorityOptions = async () => {
  return {
    options: URGENCY_LEVELS?.map((priorityLevel) => ({
      value: priorityLevel.value,
      label: priorityLevel.title
    })),
    hasMore: false
  }
}

export const getDisplayDistributeLabel = (processRole: TDocumentProcessRole) => {
  if (processRole === DOCUMENT_PROCESS_ROLES?.Leader) {
    return {
      fullLabel: 'Chủ trì',
      shortLabel: 'CT'
    }
  }
  if (processRole === DOCUMENT_PROCESS_ROLES?.Director) {
    return {
      fullLabel: 'Chỉ đạo',
      shortLabel: 'CĐ'
    }
  }
  if (processRole === DOCUMENT_PROCESS_ROLES?.Collaborator) {
    return {
      fullLabel: 'Phối hợp',
      shortLabel: 'PH'
    }
  }
  return {
    fullLabel: 'Xem để biết',
    shortLabel: 'Xem'
  }
}

export const mappingRelatedFromDocType = (docType: TDocumentType): RelatedFileRequestTypeEnum => {
  if (docType === APP_DOCUMENT_TYPES.inDoc) {
    return 'IN_DOCUMENT_FILE'
  }
  if (docType === APP_DOCUMENT_TYPES.outDoc) {
    return 'OUT_DOCUMENT_FILE'
  }
  return 'INTERNAL_DOCUMENT_FILE'
}

export const groupEventsWithSameActor = (events: ProcessingEventVM[]) => {
  const map = new Map<string, TProcessHistoryGroupEvent>()

  for (const e of events ?? []) {
    const key =
      e.positionId != null
        ? `positionId:${e.positionId}`
        : e.unitId != null
          ? `unitId:${e.unitId}`
          : null

    // null never groups
    const mapKey = key ?? `unique:${crypto.randomUUID()}`

    if (!map.has(mapKey)) {
      map.set(mapKey, {
        positionId: e.positionId,
        unitId: e.unitId,
        documentId: e.documentId,
        displayName: e.displayName,
        eventItems: []
      })
    }

    map.get(mapKey)!.eventItems.push({
      actionName: e.actionName,
      timestamp: e.timestamp,
      receivers: e.receivers,
      message: e.message,
      files: e.files
    })
  }

  return Array.from(map.values())
}
