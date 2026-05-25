import type {
  TCreateIncomingPaperFormData,
  TCreatePaperInDocParams,
  TSigningOption
} from '../models/inDocTypes'

function buildMetadata(formData: TCreateIncomingPaperFormData) {
  const toDateOnly = (d?: Date) => d?.toISOString().slice(0, 10)
  const rawCode = (formData.documentCode || '').trim()
  const resolvedIssuer = formData.issueUnit?.name
  return {
    dueDate: toDateOnly(formData.dueDate) || '',
    priority: formData.priorityLevel?.value,
    arrivalDate: toDateOnly(formData.inDate) || '',
    subject: formData.description || '',
    code: rawCode,
    documentType: formData.documentType?.label || '',
    signerInfo: {
      name: formData.signerName?.trim() || '',
      position: formData.signerRole?.trim() || ''
    },
    issuedDate: toDateOnly(formData.issueDate) || '',
    issuer: resolvedIssuer || '',
    description: formData.note || ''
  }
}

// Xử lý form data để build signing option
function buildSigningOption(formData: TCreateIncomingPaperFormData): TSigningOption {
  return {
    mustSignMainFile: !!formData.signAttachment,
    mustSignAnnexes: !!formData.signAppendix,
    signingProvider: formData?.provider
  }
}

export function preProcessDataForAddPaperID(formData: TCreateIncomingPaperFormData) {
  const metadata = buildMetadata(formData)
  const signingOption = buildSigningOption(formData)
  const rawDocumentBookValue = formData.documentBook?.value
  const resolvedDocumentBookId =
    typeof rawDocumentBookValue === 'string'
      ? rawDocumentBookValue
      : (rawDocumentBookValue as { id?: string })?.id

  const params: TCreatePaperInDocParams = {
    mainFile: formData.attachmentFile,
    documentBookId: resolvedDocumentBookId!,
    inOrdinal: Number(formData.inOrdinal),
    unitId: formData.affectedTenant?.value!,
    metadata,
    annexes: formData.appendixFiles ?? [],
    signingOption
  }

  return params
}
