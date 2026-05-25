import { DOCUMENT_TYPES } from '@/shared/constants/document'
import { OD_SIGN_TYPES } from '@/shared/constants/sign'
import type { TFormSelectDestinationValue } from '@/shared/models/outDoc/destination'
import type { TJoinUnitPayload } from '@/shared/models/outDoc/document'
import { OUT_DOC_PROCESS_TYPES } from '@/shared/models/outDoc/document'
import type { RelatedFileRequestTypeEnum } from '@/shared/services/api'
import { cleanObject } from '@/shared/utils/common'
import { mappingRelatedFromDocType } from '@/shared/utils/document'
import { DateTime } from 'luxon'
import type z from 'zod'
import type { createEDocSchema, createPaperOutDocSchema } from '../schemas/documentSchema'

export const preparePreviewCreateDocData = (values: z.infer<typeof createEDocSchema>) => {
  const jointUnitIds: TJoinUnitPayload[] = []
  if (!values?.issueUnit?.id || !(values?.mainFile instanceof File)) return

  if ('jointUnits' in values) {
    values?.jointUnits?.forEach((jointUnit) => {
      if (jointUnit?.unit)
        jointUnitIds?.push({
          index: jointUnit?.index,
          unitId: jointUnit?.unit?.id
        })
    })
  }
  return {
    metadataRequest: cleanObject({
      unitIds: jointUnitIds,
      issuedUnitId: values?.issueUnit?.id,
      haveCreatorSign: !!values?.creatorSignFile,
      processingSteps: {
        steps: (values?.signFlow ?? [])?.map((step, idx) => {
          if (
            step?.signType === OD_SIGN_TYPES.leaderUnitSigner ||
            step?.signType === OD_SIGN_TYPES.staffUnitSigner ||
            step?.signType === OD_SIGN_TYPES.leaderCollaborator ||
            step?.signType === OD_SIGN_TYPES.staffCollaborator
          ) {
            return {
              signers: (step?.staffs ?? [])?.map((signer) => ({
                signerIndex: signer?.index,
                staffId: signer?.staff?.positionId!
              })),
              stepName: step?.signType,
              stepIndex: idx
            }
          }
          return {
            signers: step?.staff?.positionId
              ? [
                  {
                    signerIndex: 0,
                    staffId: step?.staff?.positionId
                  }
                ]
              : [],
            stepName: step?.signType!,
            stepIndex: idx
          }
        })
      },
      isEnglish: values?.processType?.value === OUT_DOC_PROCESS_TYPES.english,
      type: DOCUMENT_TYPES.outDoc
    }),
    file: values?.mainFile
  }
}

export const prepareCreateData = (
  values: z.infer<typeof createEDocSchema>,
  oldDocId?: string,
  listViewerDirector?: TFormSelectDestinationValue[]
) => {
  console.log(listViewerDirector, 'listViewerDirector')
  if (
    !values?.issueUnit?.id ||
    !(values?.mainFile instanceof File) ||
    !values?.documentType?.value ||
    !values?.urgencyLevel?.value ||
    !values?.subject
  )
    return

  return {
    haveCreatorSign: !!values?.creatorSignFile,
    issuedUnitId: values?.issueUnit?.id,
    metadataRequest: cleanObject({
      documentTypeId: values?.documentType?.value,
      documentType: values?.documentType?.label ?? '',
      dueDate: values?.dueDate ? DateTime.fromJSDate(values.dueDate).toISODate()! : undefined,
      priority: values?.urgencyLevel?.value,
      subject: values?.subject,
      description: values?.description ?? undefined,
      isEnglish: values?.processType?.value === OUT_DOC_PROCESS_TYPES.english,
      haveNumber: values?.processType?.value !== OUT_DOC_PROCESS_TYPES.noNum,
      relatedContent: values?.relatedContent
    }),
    oldDocumentId: oldDocId,
    replaceDocumentId:
      values?.processTypeValue === OUT_DOC_PROCESS_TYPES?.replace
        ? values?.replaceDocId
        : undefined,
    processingStepDto: {
      steps: (values?.signFlow ?? [])?.map((step, idx) => {
        if (
          step?.signType === OD_SIGN_TYPES.leaderUnitSigner ||
          step?.signType === OD_SIGN_TYPES.staffUnitSigner ||
          step?.signType === OD_SIGN_TYPES.leaderCollaborator ||
          step?.signType === OD_SIGN_TYPES.staffCollaborator
        ) {
          return {
            signers: (step?.staffs ?? [])?.map((signer) => ({
              signerIndex: signer?.index,
              staffId: signer?.staff?.positionId!
            })),
            stepName: step?.signType,
            stepIndex: idx
          }
        }
        return {
          signers: step?.staff?.positionId
            ? [
                {
                  signerIndex: 0,
                  staffId: step?.staff?.positionId!
                }
              ]
            : [],
          stepName: step?.signType!,
          stepIndex: idx
        }
      })
    },
    mainFile: values?.mainFile,
    annexes: values?.annexesFiles,
    //update later
    relatedFileRequests: [
      ...(values?.relatedFiles?.fromDoc ?? [])?.map((relatedDoc) => ({
        relatedId: relatedDoc?.id,
        type: mappingRelatedFromDocType(relatedDoc?.docType)
      })),
      ...(values?.relatedFiles?.fromTask ?? [])?.map((relatedTask) => ({
        relatedId: relatedTask?.id,
        type: 'WORK_FILE' as RelatedFileRequestTypeEnum
      }))
    ],
    relatedUploadFiles: (values?.relatedFiles?.upload ?? [])?.map((uploadFile) => uploadFile?.file),
    jointUnits:
      values?.processTypeValue === OUT_DOC_PROCESS_TYPES?.joint
        ? values?.jointUnits?.map((jointUnit) => ({
            index: jointUnit?.index,
            unitId: jointUnit?.unit?.id!
          }))
        : [],
    destinations: JSON.stringify(
      [...(values?.destinations ?? []), ...[...(listViewerDirector ?? [])]]?.map((destination) => ({
        type: destination?.type,
        systemType: destination?.systemType,
        role: destination?.formName,
        destinationId: destination?.id
      }))
    )
  }
}

export const prepareCreatePaperOutDocData = (
  values: z.infer<typeof createPaperOutDocSchema>,
  oldDocId?: string,
  listViewerDirector?: TFormSelectDestinationValue[]
) => {
  if (
    !values?.issueUnit?.id ||
    !(values?.mainFile instanceof File) ||
    !values?.documentType?.value ||
    !values?.urgencyLevel?.value ||
    !values?.subject
  )
    return
  return {
    issueUnitId: values?.issueUnit?.id,
    metadataRequest: cleanObject({
      documentTypeId: values?.documentType?.value,
      documentType: values?.documentType?.label ?? '',
      dueDate: values?.dueDate ? DateTime.fromJSDate(values.dueDate).toISODate()! : undefined,
      priority: values?.urgencyLevel?.value,
      subject: values?.subject,
      description: values?.description,
      relatedContent: values?.relatedContent,
      isEnglish: false,
      haveNumber: true
    }),
    oldDocumentId: oldDocId,
    processingStepDto: {
      steps: (values?.signFlow ?? [])?.map((step, idx) => {
        if (
          step?.signType === OD_SIGN_TYPES.leaderUnitSigner ||
          step?.signType === OD_SIGN_TYPES.staffUnitSigner ||
          step?.signType === OD_SIGN_TYPES.leaderCollaborator ||
          step?.signType === OD_SIGN_TYPES.staffCollaborator
        ) {
          return {
            signers: (step?.staffs ?? [])?.map((signer) => ({
              signerIndex: signer?.index,
              staffId: signer?.staff?.positionId!
            })),
            stepName: step?.signType,
            stepIndex: idx
          }
        }
        return {
          signers: step?.staff?.positionId
            ? [
                {
                  signerIndex: 0,
                  staffId: step?.staff?.positionId!
                }
              ]
            : [],
          stepName: step?.signType!,
          stepIndex: idx
        }
      })
    },
    mainFile: values?.mainFile,
    annexes: values?.annexesFiles,
    //update later
    relatedFileRequests: [
      ...(values?.relatedFiles?.fromDoc ?? [])?.map((relatedDoc) => ({
        relatedId: relatedDoc?.id,
        type: mappingRelatedFromDocType(relatedDoc?.docType)
      })),
      ...(values?.relatedFiles?.fromTask ?? [])?.map((relatedTask) => ({
        relatedId: relatedTask?.id,
        type: 'WORK_FILE' as RelatedFileRequestTypeEnum
      }))
    ],
    relatedUploadFiles: (values?.relatedFiles?.upload ?? [])?.map((uploadFile) => uploadFile?.file),
    destinations: [...(values?.destinations ?? []), ...[...(listViewerDirector ?? [])]]?.map(
      (destination) => ({
        type: destination?.type,
        systemType: destination?.systemType,
        role: destination?.formName,
        destinationId: destination?.id
      })
    )
  }
}

export function transformUsedNumberDisplay(arr: number[]): string {
  if (!arr.length) return ''
  if (arr?.length === 1) return `${arr[0]}`
  const result: string[] = []
  let start = arr[0]!
  let prev = arr[0]!

  for (let i = 1; i < arr.length; i++) {
    const curr = arr[i]!

    if (curr === prev + 1) {
      prev = curr
      continue
    }

    // close current range
    if (start === prev) {
      result.push(`${start}`)
    } else {
      result.push(`${start}-${prev}`)
    }

    start = curr
    prev = curr
  }

  // push last range
  if (start === prev) {
    result.push(`${start}`)
  } else {
    result.push(`${start}-${prev}`)
  }

  return result.join(', ')
}
