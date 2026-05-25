import type { SignDocumentCommand } from '../services/api'

export type TSignType =
  | 'UnitSigner'
  | 'Collaborator'
  | 'MajorSigner'
  | 'MinorSigner'
  | 'Evaluator'
  | 'FormalSigner'
export type TSignFlow = {
  id: string
  name: string
  signTypeOrders: TSignType[]
}

export type TSignProviderValue =
  | 'HMUH'
  | 'VNPT'
  | 'VIETTEL_REMOTE'
  | 'VIETTEL_SIM'
  | 'MOBI_SIM'
  | 'BSIGN'
  | 'USB'
  | 'EASYCA'

export type TSignRemotePayload = {
  docId: string
  body: SignDocumentCommand
}
