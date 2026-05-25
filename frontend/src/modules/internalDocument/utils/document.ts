import { DOCUMENT_TYPES } from '@/shared/constants/document'
import { OD_SIGN_TYPES } from '@/shared/constants/sign'
import type { TFormSelectDestinationValue } from '@/shared/models/outDoc/destination'
import { OUT_DOC_PROCESS_TYPES } from '@/shared/models/outDoc/document'
import type { RelatedFileRequestTypeEnum } from '@/shared/services/api'
import { cleanObject } from '@/shared/utils/common'
import { mappingRelatedFromDocType } from '@/shared/utils/document'
import { DateTime } from 'luxon'
import type z from 'zod'
import type { createInternalDocSchema } from '../schemas/documentSchema'

export const preparePreviewCreateDocData = (
  values: z.infer<typeof createInternalDocSchema>,
  issueUnitId: string
) => {
  if (!issueUnitId || !(values?.mainFile instanceof File)) return

  return {
    metadataRequest: cleanObject({
      unitIds: [],
      issuedUnitId: issueUnitId,
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
      type: DOCUMENT_TYPES.internalDoc
    }),
    file: values?.mainFile
  }
}

export const prepareCreateData = (
  values: z.infer<typeof createInternalDocSchema>,
  creatorUnitId: string,
  listViewerDirector?: TFormSelectDestinationValue[]
) => {
  if (
    !(values?.mainFile instanceof File) ||
    !values?.documentType?.value ||
    !values?.urgencyLevel?.value ||
    !values?.subject
  )
    return

  return {
    haveCreatorSign: !!values?.creatorSignFile,
    issuedUnitId: creatorUnitId,
    metadataRequest: cleanObject({
      documentTypeId: values?.documentType?.value?.id,
      documentType: values?.documentType?.label ?? '',
      dueDate: values?.dueDate ? DateTime.fromJSDate(values.dueDate).toISODate()! : undefined,
      priority: values?.urgencyLevel?.value,
      subject: values?.subject,
      description: values?.description ?? undefined,
      isEnglish: values?.processType?.value === OUT_DOC_PROCESS_TYPES.english,
      haveNumber: values?.processType?.value !== OUT_DOC_PROCESS_TYPES.noNum,
      relatedContent: values?.relatedContent
    }),
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
    notation: values?.notation,
    relatedUploadFiles: (values?.relatedFiles?.upload ?? [])?.map((uploadFile) => uploadFile?.file),
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
